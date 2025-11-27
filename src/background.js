/* Minimal tracker engine: manages trackers via storage and messaging */
const STORAGE_KEY = 'tempo_trackers';
const SETTINGS_KEY = 'tempo_settings';

// OAuth Configuration
const OAUTH_CONFIG = {
  clientId: 'mum0qIftHXSPAMLJyFa0rqpjTvtP8tYZ',
  clientSecret: 'ATOAeBywdVhDuR35N5BpsGxpClncE7u88dsK65536VA7DDWf0DfzEe2fM36xgON11kd6A222AC2F',
  tokenUrl: 'https://auth.atlassian.com/oauth/token',
  redirectUri: 'https://claudio-ferraro.github.io/tempo-time-tracker-for-firefox/callback'
};

// ============================================
// OAUTH CALLBACK LISTENER
// ============================================
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process when status is complete and URL matches
  if (!tab.url || !tab.url.startsWith(OAUTH_CONFIG.redirectUri)) {
    return;
  }
  
  // Wait for the page to fully load
  if (changeInfo.status !== 'complete') {
    return;
  }
  
  console.log('=== OAuth callback detected ===');
  console.log('URL:', tab.url);
  
  try {
    const url = new URL(tab.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    if (error) {
      console.error('OAuth error from Atlassian:', error);
      await browser.tabs.remove(tabId);
      return;
    }
    
    if (!code) {
      console.log('No code in URL, ignoring');
      return;
    }
    
    // Get stored OAuth state
    const stored = await browser.storage.local.get(['oauth_state', 'oauth_code_verifier']);
    
    if (state !== stored.oauth_state) {
      console.error('State mismatch! Expected:', stored.oauth_state, 'Got:', state);
      await browser.tabs.remove(tabId);
      return;
    }
    
    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
    
    const tokenResult = await exchangeCodeForTokens(code, stored.oauth_code_verifier);
    
    if (tokenResult.ok) {
      console.log('Tokens received! Fetching user info...');
      await fetchAndStoreUserInfo(tokenResult.access_token);
      console.log('=== Login successful! ===');
    } else {
      console.error('Token exchange failed:', tokenResult.error);
    }
    
    // Clean up OAuth state
    await browser.storage.local.remove(['oauth_state', 'oauth_code_verifier']);
    
    // Close the callback tab after a small delay
    setTimeout(async () => {
      try {
        await browser.tabs.remove(tabId);
      } catch (e) {
        console.log('Tab already closed');
      }
    }, 500);
    
  } catch (e) {
    console.error('Error handling OAuth callback:', e);
  }
});

async function exchangeCodeForTokens(code, codeVerifier) {
  try {
    const requestBody = {
      grant_type: 'authorization_code',
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
      code: code,
      redirect_uri: OAUTH_CONFIG.redirectUri,
      code_verifier: codeVerifier
    };
    
    const response = await fetch(OAUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', response.status, errorText);
      return { ok: false, error: errorText };
    }
    
    const tokens = await response.json();
    console.log('Tokens received successfully');
    
    // Store tokens
    await browser.storage.local.set({
      tempo_access_token: tokens.access_token,
      tempo_refresh_token: tokens.refresh_token,
      token_expires_at: Date.now() + (tokens.expires_in * 1000)
    });
    
    return { ok: true, access_token: tokens.access_token };
  } catch (e) {
    console.error('Error exchanging code for tokens:', e);
    return { ok: false, error: e.message };
  }
}

async function fetchAndStoreUserInfo(accessToken) {
  try {
    // Get accessible resources (Atlassian sites)
    const resourcesRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (resourcesRes.ok) {
      const resources = await resourcesRes.json();
      await browser.storage.local.set({ accessible_resources: resources });
      console.log('Accessible resources:', resources);
    }
    
    // Get user info
    const userRes = await fetch('https://api.atlassian.com/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (userRes.ok) {
      const user = await userRes.json();
      await browser.storage.local.set({
        user_info: {
          name: user.name || user.displayName || user.nickname,
          email: user.email,
          picture: user.picture,
          accountId: user.account_id
        }
      });
      console.log('User info stored:', user.name || user.displayName);
    }
  } catch (e) {
    console.error('Error fetching user info:', e);
  }
}

/**
 * Tracker shape: { id, issueKey, description, startedAt, pausedAt, accumMs, status }
 * status: 'running' | 'paused' | 'stopped'
 */

async function getTrackers() {
  const { [STORAGE_KEY]: trackers = [] } = await browser.storage.local.get(STORAGE_KEY);
  return trackers;
}

async function setTrackers(trackers) {
  await browser.storage.local.set({ [STORAGE_KEY]: trackers });
  await updateBadge(trackers);
  browser.runtime.sendMessage({ type: 'trackers:updated', trackers });
}

async function getSettings() {
  const { [SETTINGS_KEY]: settings = { allowMultiple: true, showOnlyOnJira: false, hideTrackersOnScreen: false } } = await browser.storage.local.get(SETTINGS_KEY);
  return settings;
}

async function setSettings(settings) {
  await browser.storage.local.set({ [SETTINGS_KEY]: settings });
}

function nowMs() { return Date.now(); }

function computeDurationMs(t) {
  let ms = t.accumMs || 0;
  if (t.status === 'running' && t.startedAt) {
    ms += nowMs() - t.startedAt;
  }
  return ms;
}

async function updateBadge(trackers) {
  const runningCount = trackers.filter(t => t.status === 'running').length;
  const text = runningCount > 0 ? String(runningCount) : '';
  await browser.action.setBadgeText({ text });
  await browser.action.setBadgeBackgroundColor({ color: '#0B5FFF' });
}

async function startTracker({ issueKey, description }) {
  const settings = await getSettings();
  const trackers = await getTrackers();
  if (!settings.allowMultiple && trackers.some(t => t.status === 'running')) {
    return { error: 'Multiple trackers disabled' };
  }
  const id = crypto.randomUUID();
  const tracker = { id, issueKey: issueKey || null, description: description || '', startedAt: nowMs(), pausedAt: null, accumMs: 0, status: 'running' };
  trackers.push(tracker);
  await setTrackers(trackers);
  return { ok: true, tracker };
}

async function pauseTracker(id) {
  const trackers = await getTrackers();
  const t = trackers.find(x => x.id === id);
  if (!t || t.status !== 'running') return { error: 'Tracker not running' };
  t.accumMs = computeDurationMs(t);
  t.status = 'paused';
  t.startedAt = null;
  t.pausedAt = nowMs();
  await setTrackers(trackers);
  return { ok: true };
}

async function resumeTracker(id) {
  const settings = await getSettings();
  const trackers = await getTrackers();
  const t = trackers.find(x => x.id === id);
  if (!t || t.status !== 'paused') return { error: 'Tracker not paused' };
  if (!settings.allowMultiple && trackers.some(x => x.status === 'running' && x.id !== id)) {
    return { error: 'Multiple trackers disabled' };
  }
  t.startedAt = nowMs();
  t.pausedAt = null;
  t.status = 'running';
  await setTrackers(trackers);
  return { ok: true };
}

async function stopTracker(id) {
  const trackers = await getTrackers();
  const t = trackers.find(x => x.id === id);
  if (!t) return { error: 'Tracker not found' };
  t.accumMs = computeDurationMs(t);
  t.status = 'stopped';
  t.startedAt = null;
  t.pausedAt = null;
  await setTrackers(trackers);
  return { ok: true, durationMs: t.accumMs };
}

async function removeTracker(id) {
  const trackers = await getTrackers();
  const next = trackers.filter(x => x.id !== id);
  await setTrackers(next);
  return { ok: true };
}

function msToHMS(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
}

browser.runtime.onMessage.addListener(async (msg) => {
  switch (msg?.type) {
    case 'trackers:list':
      return await getTrackers();
    case 'trackers:start':
      return await startTracker(msg.payload || {});
    case 'trackers:pause':
      return await pauseTracker(msg.id);
    case 'trackers:resume':
      return await resumeTracker(msg.id);
    case 'trackers:stop':
      return await stopTracker(msg.id);
    case 'trackers:remove':
      return await removeTracker(msg.id);
    case 'settings:get':
      return await getSettings();
    case 'settings:set':
      await setSettings(msg.settings);
      return { ok: true };
    case 'tempo:log-open':
      // Placeholder: open Tempo Timesheets form
      if (msg.issueKey) {
        await browser.tabs.create({ url: `https://tempo.io/automated-time-tracking` });
      }
      return { ok: true };
    default:
      return { error: 'unknown-message' };
  }
});

// Periodically update badge to reflect running trackers
browser.alarms.create('updateBadge', { periodInMinutes: 1 });
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'updateBadge') {
    const trackers = await getTrackers();
    await updateBadge(trackers);
  }
});
