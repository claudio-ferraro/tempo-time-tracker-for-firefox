// Tempo Time Tracker Overlay - Modern UI
(function() {
  if (window.__tempoOverlayInjected) return;
  window.__tempoOverlayInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    #tempo-overlay {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 2147483647;
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color-scheme: light only;
    }
    
    #tempo-overlay * {
      box-sizing: border-box;
      color-scheme: light only;
    }
    
    .tempo-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0 6px 0 16px;
      gap: 12px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: visible;
      border: 1px solid rgba(0, 0, 0, 0.06);
    }
    
    .tempo-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      bottom: 8px;
      width: 4px;
      background: linear-gradient(180deg, #10B981 0%, #34D399 100%);
      border-radius: 0 4px 4px 0;
    }
    
    .tempo-card.paused::before {
      background: linear-gradient(180deg, #F59E0B 0%, #FBBF24 100%);
    }
    
    .tempo-card:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    .tempo-card.expanded {
      flex-direction: column;
      align-items: stretch;
      width: 320px;
      height: auto;
      padding: 20px;
      gap: 16px;
      border-radius: 20px;
    }
    
    .tempo-card.expanded::before {
      top: 16px;
      bottom: 16px;
    }
    
    .tempo-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 10px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      color: #64748B;
    }
    
    .tempo-btn:hover {
      background: #F1F5F9;
      color: #1E293B;
      transform: scale(1.05);
    }
    
    .tempo-btn:active {
      transform: scale(0.95);
    }
    
    .tempo-btn svg {
      width: 20px;
      height: 20px;
    }
    
    .tempo-btn.danger:hover {
      background: #FEF2F2;
      color: #EF4444;
    }
    
    .tempo-btn.play-pause {
      background: #F8FAFC;
      color: #1E293B;
    }
    
    .tempo-btn.play-pause:hover {
      background: #E2E8F0;
    }
    
    .tempo-time {
      font-size: 16px;
      font-weight: 700;
      color: #1E293B;
      min-width: 90px;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    
    .tempo-time.large {
      font-size: 36px;
      font-weight: 800;
      text-align: center;
      padding: 8px 0;
      background: linear-gradient(135deg, #1E293B 0%, #475569 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .tempo-issue {
      font-size: 13px;
      font-weight: 600;
      color: #64748B;
      padding: 8px 14px;
      background: #F8FAFC;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .tempo-issue:hover {
      background: #F1F5F9;
      border-color: #CBD5E1;
    }
    
    .tempo-issue.has-issue {
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
      color: #4F46E5;
      border-color: #C7D2FE;
    }
    
    .tempo-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #E2E8F0;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      color: #1E293B;
      background: #FFFFFF;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
    }
    
    .tempo-input:focus {
      outline: none;
      border-color: #6366F1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }
    
    .tempo-input::placeholder {
      color: #94A3B8;
      font-weight: 400;
    }
    
    .tempo-textarea {
      resize: none;
      min-height: 80px;
      font-family: inherit;
      line-height: 1.5;
    }
    
    .tempo-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      background: #FFFFFF;
      border-radius: 14px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 10;
      max-height: 220px;
      overflow-y: auto;
      border: 1px solid rgba(0, 0, 0, 0.06);
    }
    
    .tempo-dropdown-header {
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    
    .tempo-dropdown-item {
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #1E293B;
      transition: background 0.15s ease;
    }
    
    .tempo-dropdown-item:hover {
      background: #F8FAFC;
    }
    
    .tempo-dropdown-item .issue-key {
      font-weight: 700;
      color: #6366F1;
    }
    
    .tempo-log-btn {
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      padding: 16px 24px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      flex: 1;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    
    .tempo-log-btn:hover {
      background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }
    
    .tempo-log-btn:active {
      transform: translateY(0);
    }
    
    .tempo-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .tempo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .tempo-mini {
      background: #FFFFFF;
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(0, 0, 0, 0.06);
      color: #64748B;
    }
    
    .tempo-mini:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-3px);
      color: #1E293B;
    }
    
    .tempo-mini:active {
      transform: translateY(-1px);
    }
    
    .tempo-mini svg {
      width: 22px;
      height: 22px;
    }
    
    .tempo-badge {
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      color: #FFFFFF;
      border-radius: 10px;
      padding: 8px 14px;
      font-weight: 800;
      font-size: 16px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    
    .tempo-start {
      background: #FFFFFF;
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      padding: 0 20px;
      height: 56px;
      gap: 12px;
      cursor: pointer;
      border: 1px solid rgba(0, 0, 0, 0.06);
      font-size: 15px;
      font-weight: 600;
      color: #1E293B;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .tempo-start:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-3px);
    }
    
    .tempo-start:active {
      transform: translateY(-1px);
    }
    
    .tempo-start svg {
      color: #6366F1;
    }
    
    .tempo-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .tempo-mini.add-btn {
      color: #6366F1;
    }
    
    .tempo-mini.add-btn:hover {
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
      color: #4F46E5;
    }
  `;
  document.head.appendChild(style);

  // SVG Icons
  const icons = {
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>`,
    external: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`,
    chevronUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`,
    chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`,
  };

  const overlay = document.createElement('div');
  overlay.id = 'tempo-overlay';

  // State
  let minimized = true; // Start minimized by default
  let loggedIn = false;
  let trackers = [];
  let expandedTrackerId = null;
  let timerInterval = null;
  let recentIssues = [];
  let searchResults = [];
  let isSearching = false;
  let searchQuery = '';
  let cloudId = null;
  let searchTimeout = null;

  function getIssueKeyFromPage() {
    try {
      const url = new URL(window.location.href);
      const selectedIssue = url.searchParams.get('selectedIssue');
      if (selectedIssue && /([A-Z][A-Z0-9]+-\d+)/i.test(selectedIssue)) {
        return selectedIssue.toUpperCase();
      }

      const path = url.pathname || '';
      let m = path.match(/\/browse\/([A-Z][A-Z0-9]+-\d+)/i) || path.match(/\/issues\/([A-Z][A-Z0-9]+-\d+)/i);
      if (m && m[1]) {
        return m[1].toUpperCase();
      }

      m = url.href.match(/([A-Z][A-Z0-9]+-\d+)/i);
      if (m && m[1]) {
        return m[1].toUpperCase();
      }

      const titleMatch = (document.title || '').match(/([A-Z][A-Z0-9]+-\d+)/);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1].toUpperCase();
      }
    } catch (e) {}
    return null;
  }

  // Load trackers from storage
  async function loadTrackers() {
    try {
      const result = await browser.storage.local.get('tempo_trackers');
      if (result.tempo_trackers && Array.isArray(result.tempo_trackers)) {
        trackers = result.tempo_trackers.map(t => {
          // Calculate elapsed time since last save for running trackers
          if (!t.paused && t.startedAt) {
            const additionalTime = Date.now() - t.startedAt;
            return {
              ...t,
              elapsed: (t.elapsed || 0) + additionalTime,
              startedAt: Date.now() // Reset start time to now
            };
          }
          return t;
        });
        
        if (trackers.some(t => !t.paused)) {
          startTimer();
        }
      }
    } catch (e) {
      console.error('Error loading trackers:', e);
    }
    render();
  }

  // Save trackers to storage
  async function saveTrackers() {
    try {
      // Save with current startedAt timestamp for running trackers
      const trackersToSave = trackers.map(t => ({
        ...t,
        startedAt: t.paused ? null : Date.now()
      }));
      await browser.storage.local.set({ tempo_trackers: trackersToSave });
    } catch (e) {
      console.error('Error saving trackers:', e);
    }
  }

  async function checkLogin() {
    try {
      const result = await browser.storage.local.get(['tempo_access_token', 'accessible_resources']);
      loggedIn = !!result.tempo_access_token;
      
      // Get cloud ID for API calls
      if (result.accessible_resources && result.accessible_resources.length > 0) {
        cloudId = result.accessible_resources[0].id;
        // Load recent issues on login
        if (loggedIn && cloudId) {
          loadRecentIssues();
        }
      }
    } catch (e) {
      loggedIn = false;
    }
    render();
  }

  // Extract issue key from URL or text
  function extractIssueKey(input) {
    // Match issue key pattern like PROJ-123
    const keyMatch = input.match(/([A-Z][A-Z0-9]+-\d+)/i);
    if (keyMatch) {
      return keyMatch[1].toUpperCase();
    }
    return null;
  }

  // Get valid access token (auto-refreshes if needed)
  async function getAccessToken() {
    try {
      const result = await browser.runtime.sendMessage({ type: 'auth:getToken' });
      if (result.ok) {
        return result.access_token;
      }
      console.error('Failed to get token:', result.error);
      return null;
    } catch (e) {
      console.error('Error getting token:', e);
      return null;
    }
  }

  // Search issues via Jira API - using issue picker for autocomplete
  async function searchIssues(query) {
    if (!loggedIn || !cloudId) {
      console.log('Cannot search: loggedIn=', loggedIn, 'cloudId=', cloudId);
      return [];
    }
    
    try {
      const token = await getAccessToken();
      if (!token) {
        console.error('No valid token available');
        return [];
      }
      
      // Check if query contains an issue key (from URL or direct input)
      const issueKey = extractIssueKey(query);
      
      if (issueKey) {
        // Direct issue lookup by key
        console.log('Looking up issue by key:', issueKey);
        const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}?fields=key,summary,issuetype,project`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const issue = await response.json();
          return [{
            key: issue.key,
            summary: issue.fields.summary,
            type: issue.fields.issuetype?.name || 'Task',
            project: issue.fields.project?.name
          }];
        } else {
          console.log('Issue not found:', issueKey);
          return [];
        }
      }
      
      // Use issue picker for text search (better for autocomplete)
      const searchQuery = query ? encodeURIComponent(query) : '';
      const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/picker?query=${searchQuery}&currentJQL=ORDER BY updated DESC&showSubTasks=true`;
      
      console.log('Issue picker URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Picker response:', data);
        
        // Combine all sections (history, current search)
        const allIssues = [];
        if (data.sections) {
          data.sections.forEach(section => {
            if (section.issues) {
              section.issues.forEach(issue => {
                // Avoid duplicates
                if (!allIssues.find(i => i.key === issue.key)) {
                  allIssues.push({
                    key: issue.key,
                    summary: issue.summaryText || issue.summary || '',
                    type: 'Issue',
                    project: issue.key.split('-')[0]
                  });
                }
              });
            }
          });
        }
        
        console.log('Found issues:', allIssues.length);
        return allIssues.slice(0, 10);
      } else {
        const errorText = await response.text();
        console.error('Issue picker error:', response.status, errorText);
        
        // Fallback to JQL search if picker fails
        return await searchWithJQL(query, token);
      }
    } catch (e) {
      console.error('Error searching issues:', e);
    }
    return [];
  }
  
  // Fallback JQL search
  async function searchWithJQL(query, token) {
    try {
      const jql = query 
        ? `summary ~ "${query.replace(/"/g, '\\"')}" ORDER BY updated DESC`
        : `ORDER BY updated DESC`;
      
      const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=10&fields=key,summary,issuetype,project`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.issues.map(issue => ({
          key: issue.key,
          summary: issue.fields.summary,
          type: issue.fields.issuetype?.name || 'Task',
          project: issue.fields.project?.name
        }));
      }
    } catch (e) {
      console.error('JQL search error:', e);
    }
    return [];
  }

  // Load recent issues
  async function loadRecentIssues() {
    const issues = await searchIssues('');
    recentIssues = issues;
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  }

  function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      trackers.forEach(t => {
        if (!t.paused) t.elapsed += 1000;
      });
      updateTimeDisplays();
      // Save every 10 seconds to persist elapsed time
      if (Date.now() % 10000 < 1000) {
        saveTrackers();
      }
    }, 1000);
  }

  function updateTimeDisplays() {
    trackers.forEach(t => {
      const timeEl = overlay.querySelector(`[data-tracker-time="${t.id}"]`);
      if (timeEl) timeEl.textContent = formatTime(t.elapsed);
    });
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function addTracker() {
    const id = Date.now();
    const detectedIssue = getIssueKeyFromPage();
    const newTracker = { id, elapsed: 0, issue: detectedIssue || null, description: '', paused: false, startedAt: Date.now() };
    trackers.push(newTracker);
    expandedTrackerId = null; // Start collapsed
    startTimer();
    saveTrackers();
    render();
  }

  function removeTracker(id) {
    trackers = trackers.filter(t => t.id !== id);
    if (trackers.length === 0) stopTimer();
    if (expandedTrackerId === id) expandedTrackerId = null;
    saveTrackers();
    render();
  }

  function togglePause(id) {
    const t = trackers.find(t => t.id === id);
    if (t) {
      t.paused = !t.paused;
      if (t.paused) {
        // Stopping: clear startedAt
        t.startedAt = null;
      } else {
        // Resuming: set new startedAt
        t.startedAt = Date.now();
      }
    }
    saveTrackers();
    render();
  }

  function setIssue(id, issue) {
    const t = trackers.find(t => t.id === id);
    if (t) {
      t.issue = issue;
      saveTrackers();
    }
  }

  function setDescription(id, desc) {
    const t = trackers.find(t => t.id === id);
    if (t) {
      t.description = desc;
      saveTrackers();
    }
  }

  function render() {
    overlay.innerHTML = '';

    // Minimized state
    if (minimized) {
      const minBtn = document.createElement('button');
      minBtn.className = 'tempo-mini';
      minBtn.innerHTML = trackers.length > 0 
        ? `<span class="tempo-badge">${trackers.length}</span>` 
        : icons.chevronLeft;
      minBtn.onclick = () => { minimized = false; render(); };
      overlay.appendChild(minBtn);
      return;
    }

    // No trackers: show Start Tracking button
    if (trackers.length === 0) {
      const startBtn = document.createElement('button');
      startBtn.className = 'tempo-start';
      startBtn.innerHTML = `${icons.plus} Start Tracking`;
      startBtn.onclick = addTracker;
      overlay.appendChild(startBtn);

      const minBtn = document.createElement('button');
      minBtn.className = 'tempo-mini';
      minBtn.innerHTML = icons.chevronRight;
      minBtn.onclick = () => { minimized = true; render(); };
      overlay.appendChild(minBtn);
      return;
    }

    // Render tracker cards
    trackers.forEach(t => {
      const isExpanded = expandedTrackerId === t.id;
      const card = document.createElement('div');
      card.className = 'tempo-card' + (isExpanded ? ' expanded' : '') + (t.paused ? ' paused' : '');

      if (isExpanded) {
        // Header
        const header = document.createElement('div');
        header.className = 'tempo-header';
        
        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'tempo-btn play-pause';
        pauseBtn.innerHTML = t.paused ? icons.play : icons.pause;
        pauseBtn.onclick = () => togglePause(t.id);
        
        const headerActions = document.createElement('div');
        headerActions.className = 'tempo-row';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'tempo-btn danger';
        deleteBtn.innerHTML = icons.trash;
        deleteBtn.onclick = () => removeTracker(t.id);
        
        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'tempo-btn';
        collapseBtn.innerHTML = icons.chevronDown;
        collapseBtn.onclick = () => { expandedTrackerId = null; render(); };
        
        headerActions.append(deleteBtn, collapseBtn);
        header.append(pauseBtn, headerActions);
        card.appendChild(header);

        // Time
        const timeDiv = document.createElement('div');
        timeDiv.className = 'tempo-time large';
        timeDiv.setAttribute('data-tracker-time', t.id);
        timeDiv.textContent = formatTime(t.elapsed);
        card.appendChild(timeDiv);

        // Issue input with search
        const issueWrap = document.createElement('div');
        issueWrap.style.position = 'relative';
        
        const issueInput = document.createElement('input');
        issueInput.className = 'tempo-input';
        issueInput.type = 'text';
        issueInput.placeholder = 'Search for an issue...';
        issueInput.value = t.issue || '';
        issueInput.setAttribute('data-issue-input', t.id);
        
        // Create dropdown element
        const dropdown = document.createElement('div');
        dropdown.className = 'tempo-dropdown';
        dropdown.style.display = 'none';
        
        function updateDropdown() {
          const issuesToShow = searchQuery.trim() ? searchResults : recentIssues;
          const headerText = searchQuery.trim() 
            ? (isSearching ? 'Searching...' : (searchResults.length > 0 ? 'Search Results' : 'No issues found'))
            : (recentIssues.length > 0 ? 'Recent Issues' : 'Type to search');
          
          dropdown.innerHTML = `<div class="tempo-dropdown-header">${headerText}</div>`;
          
          if (isSearching) {
            const loadingItem = document.createElement('div');
            loadingItem.className = 'tempo-dropdown-item';
            loadingItem.innerHTML = `<span style="color: #94A3B8;">Loading...</span>`;
            dropdown.appendChild(loadingItem);
          } else {
            issuesToShow.forEach(issue => {
              const item = document.createElement('div');
              item.className = 'tempo-dropdown-item';
              item.innerHTML = `
                <span class="issue-key">${issue.key}</span>
                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${issue.summary}</span>
              `;
              item.onmousedown = (e) => { 
                e.preventDefault();
                issueInput.value = issue.key;
                setIssue(t.id, issue.key); 
                dropdown.style.display = 'none';
                searchResults = [];
                searchQuery = '';
              };
              dropdown.appendChild(item);
            });
          }
          
          if (!isSearching && issuesToShow.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'tempo-dropdown-item';
            emptyItem.innerHTML = `<span style="color: #94A3B8;">Type to search issues</span>`;
            dropdown.appendChild(emptyItem);
          }
        }
        
        issueInput.onfocus = () => { 
          if (loggedIn) {
            searchQuery = '';
            searchResults = [];
            updateDropdown();
            dropdown.style.display = 'block';
          }
        };
        
        issueInput.oninput = (e) => {
          const query = e.target.value;
          searchQuery = query;
          
          if (searchTimeout) clearTimeout(searchTimeout);
          
          if (!query.trim()) {
            searchResults = [];
            updateDropdown();
            return;
          }
          
          isSearching = true;
          updateDropdown();
          
          searchTimeout = setTimeout(async () => {
            const results = await searchIssues(query);
            searchResults = results;
            isSearching = false;
            updateDropdown();
          }, 300);
        };
        
        issueInput.onblur = () => { 
          setTimeout(() => { 
            dropdown.style.display = 'none';
            const val = issueInput.value.trim();
            if (val) {
              setIssue(t.id, val);
            }
          }, 200); 
        };
        
        issueInput.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const val = issueInput.value.trim();
            if (val) {
              setIssue(t.id, val);
            }
            dropdown.style.display = 'none';
            issueInput.blur();
          } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
            issueInput.blur();
          }
        };
        
        issueWrap.appendChild(issueInput);
        issueWrap.appendChild(dropdown);
        card.appendChild(issueWrap);

        // Description
        const descInput = document.createElement('textarea');
        descInput.className = 'tempo-input tempo-textarea';
        descInput.placeholder = 'Add a description...';
        descInput.value = t.description;
        descInput.oninput = (e) => setDescription(t.id, e.target.value);
        card.appendChild(descInput);

        // Link to Tempo (only show when logged in)
        if (loggedIn) {
          const linkRow = document.createElement('div');
          linkRow.className = 'tempo-actions';
          linkRow.style.justifyContent = 'flex-end';
          
          const extBtn = document.createElement('button');
          extBtn.className = 'tempo-btn';
          extBtn.innerHTML = icons.external;
          extBtn.title = 'Open Tempo Timesheets';
          extBtn.onclick = () => window.open('https://app.tempo.io/', '_blank');
          
          linkRow.append(extBtn);
          card.appendChild(linkRow);
        }

      } else {
        // Collapsed card
        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'tempo-btn play-pause';
        pauseBtn.innerHTML = t.paused ? icons.play : icons.pause;
        pauseBtn.onclick = (e) => { e.stopPropagation(); togglePause(t.id); };
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'tempo-time';
        timeSpan.setAttribute('data-tracker-time', t.id);
        timeSpan.textContent = formatTime(t.elapsed);
        
        const issueBtn = document.createElement('button');
        issueBtn.className = 'tempo-issue' + (t.issue ? ' has-issue' : '');
        issueBtn.textContent = t.issue || 'No Issue';
        issueBtn.onclick = (e) => { e.stopPropagation(); expandedTrackerId = t.id; render(); };
        
        const expandBtn = document.createElement('button');
        expandBtn.className = 'tempo-btn';
        expandBtn.innerHTML = icons.chevronUp;
        expandBtn.onclick = (e) => { e.stopPropagation(); expandedTrackerId = t.id; render(); };
        
        card.append(pauseBtn, timeSpan, issueBtn, expandBtn);
      }
      
      overlay.appendChild(card);
    });

    // Add tracker button (always visible)
    const addBtn = document.createElement('button');
    addBtn.className = 'tempo-mini add-btn';
    addBtn.innerHTML = icons.plus;
    addBtn.onclick = addTracker;
    overlay.appendChild(addBtn);

    // Minimize button
    const minBtn = document.createElement('button');
    minBtn.className = 'tempo-mini';
    minBtn.innerHTML = icons.chevronRight;
    minBtn.onclick = () => { minimized = true; render(); };
    overlay.appendChild(minBtn);
  }

  browser.storage.onChanged.addListener((changes) => {
    if (changes.tempo_access_token) {
      loggedIn = !!changes.tempo_access_token.newValue;
      if (loggedIn) {
        // Reload to get cloudId and recent issues
        checkLogin();
      }
      render();
    }
    if (changes.accessible_resources) {
      const resources = changes.accessible_resources.newValue;
      if (resources && resources.length > 0) {
        cloudId = resources[0].id;
        loadRecentIssues();
      }
    }
    // Sync trackers between tabs - always sync the full state
    if (changes.tempo_trackers) {
      const newTrackers = changes.tempo_trackers.newValue || [];
      
      // Update trackers with proper elapsed time calculation
      trackers = newTrackers.map(t => {
        if (!t.paused && t.startedAt) {
          const additionalTime = Date.now() - t.startedAt;
          return { ...t, elapsed: (t.elapsed || 0) + additionalTime, startedAt: Date.now() };
        }
        return { ...t };
      });
      
      // Start or stop timer based on tracker states
      if (trackers.some(t => !t.paused)) {
        startTimer();
      } else {
        stopTimer();
      }
      
      render();
    }
  });

  checkLogin();
  loadTrackers();
  document.body.appendChild(overlay);
})();
