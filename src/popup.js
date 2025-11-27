// Tempo Time Tracker - OAuth 2.0 Authentication
// Uses Atlassian OAuth 2.0 (3LO) with PKCE

const authScreen = document.getElementById('auth-screen');
const settingsScreen = document.getElementById('settings-screen');
const authBtn = document.getElementById('auth-btn');
const logoutBtn = document.getElementById('logoutBtn');
const openTimesheetsEl = document.getElementById('openTimesheets');
const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const userAvatarEl = document.getElementById('user-avatar');
const siteInfoEl = document.getElementById('site-info');
const siteNameEl = document.getElementById('site-name');

// ============================================
// OAUTH CONFIGURATION  
// ============================================
const OAUTH_CONFIG = {
  clientId: 'mum0qIftHXSPAMLJyFa0rqpjTvtP8tYZ',
  authUrl: 'https://auth.atlassian.com/authorize',
  tokenUrl: 'https://auth.atlassian.com/oauth/token',
  scopes: [
    'read:me',
    'read:jira-user', 
    'read:jira-work',
    'write:jira-work',
    'offline_access'
  ],
  redirectUri: 'https://claudio-ferraro.github.io/tempo-time-tracker-for-firefox/callback'
};

// ============================================
// PKCE UTILITIES
// ============================================
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

// ============================================
// AUTHENTICATION
// ============================================
async function checkLogin() {
  try {
    const { tempo_access_token, user_info, accessible_resources } = await browser.storage.local.get([
      'tempo_access_token', 
      'user_info',
      'accessible_resources'
    ]);
    
    if (tempo_access_token) {
      authScreen.style.display = 'none';
      settingsScreen.style.display = 'block';
      
      // Show user info
      if (user_info) {
        if (userNameEl) userNameEl.textContent = user_info.name || 'User';
        if (userEmailEl) userEmailEl.textContent = user_info.email || '';
        
        // Show avatar if available
        if (userAvatarEl && user_info.picture) {
          userAvatarEl.innerHTML = `<img src="${user_info.picture}" alt="Avatar">`;
        }
      }
      
      // Show connected site
      if (accessible_resources?.length > 0 && siteInfoEl && siteNameEl) {
        siteInfoEl.style.display = 'flex';
        siteNameEl.textContent = accessible_resources[0].name || accessible_resources[0].url;
      }
      
    } else {
      authScreen.style.display = 'flex';
      settingsScreen.style.display = 'none';
    }
  } catch (e) {
    console.error('Error checking login:', e);
    authScreen.style.display = 'flex';
    settingsScreen.style.display = 'none';
  }
}

async function doLogin() {
  authBtn.disabled = true;
  authBtn.innerHTML = '<span class="spinner"></span> Connecting...';
  
  try {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    
    // Store PKCE values for callback to use
    await browser.storage.local.set({
      oauth_code_verifier: codeVerifier,
      oauth_state: state
    });
    
    // Build authorization URL
    const authUrl = new URL(OAUTH_CONFIG.authUrl);
    authUrl.searchParams.set('audience', 'api.atlassian.com');
    authUrl.searchParams.set('client_id', OAUTH_CONFIG.clientId);
    authUrl.searchParams.set('scope', OAUTH_CONFIG.scopes.join(' '));
    authUrl.searchParams.set('redirect_uri', OAUTH_CONFIG.redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    
    console.log('Opening auth URL in new tab...');
    console.log('Redirect URI:', OAUTH_CONFIG.redirectUri);
    
    // Open in new tab instead of launchWebAuthFlow
    await browser.tabs.create({ url: authUrl.toString() });
    
    // Close popup - auth will complete in callback.html
    window.close();
    
  } catch (e) {
    console.error('OAuth error:', e);
    alert('Failed to start sign in. Please try again.');
    resetAuthButton();
  }
}

function resetAuthButton() {
  if (authBtn) {
    authBtn.disabled = false;
    authBtn.innerHTML = `
      <svg class="atlassian-icon" viewBox="0 0 32 32" fill="currentColor">
        <path d="M15.52 15.548c-.528-.576-1.392-.544-1.872.096L6.8 25.052c-.384.528-.24 1.296.336 1.584.144.096.336.144.528.144h10.464c.384 0 .72-.24.912-.576.048-.096.048-.144.048-.192-.048-.192-.096-.336-.192-.48l-3.376-9.984z"/>
        <path d="M16.48 5.22c-2.736 4.032-2.88 9.12-.384 13.296l3.408 5.712c.192.336.576.528.96.528h10.464c.624 0 1.056-.624.768-1.152L17.856 5.316c-.384-.624-1.104-.72-1.376-.096z"/>
      </svg>
      Sign in with Atlassian
    `;
  }
}

async function doLogout() {
  await browser.storage.local.remove([
    'tempo_access_token',
    'tempo_refresh_token', 
    'token_expires_at',
    'user_info',
    'accessible_resources'
  ]);
  checkLogin();
}

// ============================================
// EVENT LISTENERS
// ============================================
if (authBtn) authBtn.addEventListener('click', doLogin);
if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
if (openTimesheetsEl) {
  openTimesheetsEl.addEventListener('click', async () => {
    const { accessible_resources } = await browser.storage.local.get('accessible_resources');
    if (accessible_resources?.length > 0) {
      browser.tabs.create({ url: `${accessible_resources[0].url}/plugins/servlet/ac/io.tempo.jira/tempo-app#!/my-work/week` });
    } else {
      browser.tabs.create({ url: 'https://app.tempo.io/' });
    }
  });
}

// Initialize
checkLogin();
