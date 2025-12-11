document.addEventListener('DOMContentLoaded', async () => {
    const tabsList = document.getElementById('tabs-list');
    const sessionsList = document.getElementById('sessions-list');
    const searchInput = document.getElementById('search-input');
    const btnFocusMode = document.getElementById('btn-focus-mode');
    const btnSaveSession = document.getElementById('btn-save-session');
    const btnViewSessions = document.getElementById('btn-view-sessions');
    const btnSettings = document.getElementById('btn-settings');

    let allTabs = [];
    let groupedTabs = {};
    let showingSessions = false;

    // Initialize
    await loadTabs();
    setupEventListeners();

    async function loadTabs() {
        try {
            if (!chrome.tabs) throw new Error("No chrome.tabs API");
            const tabs = await chrome.tabs.query({ currentWindow: true });
            allTabs = tabs;
            renderTabs(tabs);
        } catch (e) {
            console.warn("Could not load tabs (likely not in extension context). Loading Demo Data.");
            loadDemoData();
        }
    }

    function loadDemoData() {
        allTabs = [
            { id: 1, title: "Google Search", url: "https://google.com/search?q=foo", favIconUrl: "" },
            { id: 2, title: "GitHub - TabTidy", url: "https://github.com/user/tabtidy", favIconUrl: "" },
            { id: 3, title: "Stack Overflow", url: "https://stackoverflow.com/questions/123", favIconUrl: "" },
            { id: 4, title: "YouTube", url: "https://youtube.com/watch?v=123", favIconUrl: "" },
            { id: 5, title: "Notion", url: "https://notion.so/my-page", favIconUrl: "" },
            { id: 6, title: "Twitter", url: "https://twitter.com/home", favIconUrl: "" },
            { id: 7, title: "GitHub - Another Repo", url: "https://github.com/user/repo", favIconUrl: "" },
            { id: 8, title: "Gmail", url: "https://mail.google.com/mail", favIconUrl: "" },
        ];
        renderTabs(allTabs);
    }

    async function loadSessions() {
        try {
            const { sessions } = await chrome.storage.local.get(['sessions']);
            renderSessions(sessions || []);
        } catch (e) {
            renderSessions([]);
        }
    }

    function getDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (e) {
            return 'other';
        }
    }

    function groupTabsByDomain(tabs, rules = []) {
        const groups = {};

        tabs.forEach(tab => {
            const domain = getDomain(tab.url);
            let groupName = domain;

            // Check for custom rule
            const hasRule = rules.find(r => domain.includes(r.domain));
            if (hasRule) {
                groupName = hasRule.name;
            }

            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(tab);
        });
        return groups;
    }

    async function renderTabs(tabs) {
        tabsList.innerHTML = '';

        // Load rules first
        let rules = [];
        try {
            if (chrome.storage) {
                const result = await chrome.storage.local.get(['rules']);
                rules = result.rules || [];
            }
        } catch (e) { console.warn("Rules load fail"); }

        groupedTabs = groupTabsByDomain(tabs, rules);

        const sortedKeys = Object.keys(groupedTabs).sort();

        if (sortedKeys.length === 0) {
            tabsList.innerHTML = '<div class="empty-state">No tabs found.</div>';
            return;
        }

        sortedKeys.forEach(groupName => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'tab-group';

            const groupTabsList = groupedTabs[groupName];

            const headerDiv = document.createElement('div');
            headerDiv.className = 'group-header';
            headerDiv.innerHTML = `
          <div class="domain-name">
            <span>${groupName}</span>
          </div>
          <span class="tab-count">${groupTabsList.length}</span>
        `;
            groupDiv.appendChild(headerDiv);

            groupTabsList.forEach(tab => {
                const tabItem = document.createElement('div');
                tabItem.className = 'tab-item';
                tabItem.title = tab.title;
                tabItem.onclick = (e) => {
                    if (e.target.closest('.close-tab-btn')) return;
                    if (chrome.tabs) chrome.tabs.update(tab.id, { active: true });
                };

                const favIconUrl = tab.favIconUrl || 'icons/icon16.png';

                tabItem.innerHTML = `
            <img src="${favIconUrl}" class="tab-favicon" onerror="this.src='icons/icon16.png'">
            <span class="tab-title">${tab.title}</span>
            <button class="close-tab-btn" data-id="${tab.id}">×</button>
          `;

                // Close tab handler
                const closeBtn = tabItem.querySelector('.close-tab-btn');
                closeBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (chrome.tabs) await chrome.tabs.remove(tab.id);
                    tabItem.remove();
                });

                groupDiv.appendChild(tabItem);
            });

            tabsList.appendChild(groupDiv);
        });
    }

    function renderSessions(sessions) {
        sessionsList.innerHTML = '';
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<div class="empty-state">No saved sessions.</div>';
            return;
        }

        sessions.forEach((session, index) => {
            const sessionDiv = document.createElement('div');
            sessionDiv.className = 'tab-group';

            const headerDiv = document.createElement('div');
            headerDiv.className = 'group-header';
            headerDiv.style.cursor = 'pointer';

            const dateStr = new Date(session.date).toLocaleDateString();
            headerDiv.innerHTML = `
                <div class="domain-name">
                    <span>${session.name}</span>
                    <span style="font-size:10px; color:#666;">(${dateStr})</span>
                </div>
                <div>
                   <button class="small-btn restore-btn" style="margin-right:5px; background:none; border:none; color:var(--accent-color); cursor:pointer;">Restore</button>
                   <button class="small-btn delete-btn" style="background:none; border:none; color:var(--danger-color); cursor:pointer;">Del</button>
                </div>
            `;

            // Restore handler
            headerDiv.querySelector('.restore-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Restore session "${session.name}"?`)) {
                    if (chrome.tabs) {
                        session.tabs.forEach(t => chrome.tabs.create({ url: t.url, active: false }));
                    } else {
                        alert("Cannot restore in demo mode");
                    }
                }
            });

            // Delete handler
            headerDiv.querySelector('.delete-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Delete this session?')) {
                    sessions.splice(index, 1);
                    if (chrome.storage) await chrome.storage.local.set({ sessions });
                    renderSessions(sessions);
                }
            });

            sessionDiv.appendChild(headerDiv);
            sessionsList.appendChild(sessionDiv);
        });
    }

    function setupEventListeners() {
        // Search
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (showingSessions) return;

            if (!query) {
                renderTabs(allTabs);
                return;
            }

            const filteredTabs = allTabs.filter(tab =>
                tab.title.toLowerCase().includes(query) ||
                tab.url.toLowerCase().includes(query)
            );
            renderTabs(filteredTabs);
        });

        // Focus Mode
        btnFocusMode.addEventListener('click', async () => {
            await toggleFocusMode();
        });

        // Save Session
        btnSaveSession.addEventListener('click', async () => {
            const sessionName = prompt('Enter session name:', `Session ${new Date().toLocaleString()}`);
            if (sessionName) {
                await saveSession(sessionName, allTabs);
                alert('Session saved!');
                if (showingSessions) loadSessions();
            }
        });

        // View Sessions Toggle
        btnViewSessions.addEventListener('click', () => {
            showingSessions = !showingSessions;
            if (showingSessions) {
                tabsList.style.display = 'none';
                sessionsList.style.display = 'block';
                btnViewSessions.textContent = 'Tabs';
                loadSessions();
            } else {
                tabsList.style.display = 'block';
                sessionsList.style.display = 'none';
                btnViewSessions.textContent = 'Sessions';
                loadTabs();
            }
        });

        // Settings
        btnSettings.addEventListener('click', () => {
            if (chrome.runtime && chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else if (chrome.runtime) {
                window.open(chrome.runtime.getURL('settings.html'));
            }
        });
    }

    async function toggleFocusMode() {
        if (!chrome.storage) { alert("Focus Mode not available in demo"); return; }
        const { whitelist } = await chrome.storage.local.get(['whitelist']);
        const allowedDomains = whitelist || [];

        const tabsToHide = allTabs.filter(tab => {
            const domain = getDomain(tab.url);
            const isAllowed = allowedDomains.some(d => domain.includes(d));
            return !isAllowed;
        });

        if (tabsToHide.length === 0) {
            alert('No tabs to hide! All tabs are in your whitelist.');
            return;
        }

        const sessionName = `Focus Mode Backup - ${new Date().toLocaleTimeString()}`;
        await saveSession(sessionName, tabsToHide);

        const tabIds = tabsToHide.map(t => t.id);
        if (chrome.tabs) await chrome.tabs.remove(tabIds);

        loadTabs();
    }

    async function saveSession(name, tabs) {
        if (!chrome.storage) { console.log("Save session mock", name, tabs.length); return; }
        const sessionData = {
            name: name,
            date: Date.now(),
            tabs: tabs.map(t => ({ title: t.title, url: t.url, favIconUrl: t.favIconUrl }))
        };

        const { sessions } = await chrome.storage.local.get(['sessions']);
        const newSessions = sessions ? [...sessions, sessionData] : [sessionData];

        await chrome.storage.local.set({ sessions: newSessions });
    }
});
