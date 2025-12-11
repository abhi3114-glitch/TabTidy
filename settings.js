document.addEventListener('DOMContentLoaded', async () => {
    // Whitelist Elements
    const whitelistInput = document.getElementById('whitelist-input');
    const addWhitelistBtn = document.getElementById('add-whitelist-btn');
    const whitelistList = document.getElementById('whitelist-list');

    // Rules Elements
    const ruleDomainInput = document.getElementById('rule-domain');
    const ruleNameInput = document.getElementById('rule-name');
    const addRuleBtn = document.getElementById('add-rule-btn');
    const rulesList = document.getElementById('rules-list');

    // Data Management Elements
    const clearSessionsBtn = document.getElementById('clear-sessions');
    const restoreDefaultsBtn = document.getElementById('restore-defaults');

    // Load initial state
    await Promise.all([loadWhitelist(), loadRules()]);

    // --- Whitelist Logic ---
    async function loadWhitelist() {
        const { whitelist } = await chrome.storage.local.get(['whitelist']);
        renderWhitelist(whitelist || []);
    }

    function renderWhitelist(items) {
        whitelistList.innerHTML = '';
        items.forEach(domain => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${domain}</span>
                <button class="remove-btn" title="Remove">×</button>
            `;
            li.querySelector('.remove-btn').addEventListener('click', async () => {
                await removeDomain(domain);
            });
            whitelistList.appendChild(li);
        });
    }

    async function addDomain(domain) {
        if (!domain) return;
        const { whitelist } = await chrome.storage.local.get(['whitelist']);
        const currentList = whitelist || [];
        if (!currentList.includes(domain)) {
            const newList = [...currentList, domain];
            await chrome.storage.local.set({ whitelist: newList });
            renderWhitelist(newList);
        }
        whitelistInput.value = '';
    }

    async function removeDomain(domain) {
        const { whitelist } = await chrome.storage.local.get(['whitelist']);
        const currentList = whitelist || [];
        const newList = currentList.filter(d => d !== domain);
        await chrome.storage.local.set({ whitelist: newList });
        renderWhitelist(newList);
    }

    // --- Rules Logic ---
    async function loadRules() {
        const { rules } = await chrome.storage.local.get(['rules']);
        renderRules(rules || []);
    }

    function renderRules(items) {
        rulesList.innerHTML = '';
        items.forEach((rule, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <span style="font-weight:600; color:var(--text-primary);">${rule.name}</span>
                    <span style="font-size:11px; color:var(--text-secondary);">${rule.domain}</span>
                </div>
                <button class="remove-btn" title="Remove">×</button>
            `;
            li.querySelector('.remove-btn').addEventListener('click', async () => {
                await removeRule(index);
            });
            rulesList.appendChild(li);
        });
    }

    async function addRule(domain, name) {
        if (!domain || !name) return;
        const { rules } = await chrome.storage.local.get(['rules']);
        const currentRules = rules || [];

        // Simple duplicate check on domain
        const existingIndex = currentRules.findIndex(r => r.domain === domain);
        if (existingIndex >= 0) {
            if (!confirm(`Rule for ${domain} already exists. Overwrite?`)) return;
            currentRules[existingIndex] = { domain, name };
        } else {
            currentRules.push({ domain, name });
        }

        await chrome.storage.local.set({ rules: currentRules });
        renderRules(currentRules);

        ruleDomainInput.value = '';
        ruleNameInput.value = '';
    }

    async function removeRule(index) {
        const { rules } = await chrome.storage.local.get(['rules']);
        const currentRules = rules || [];
        currentRules.splice(index, 1);
        await chrome.storage.local.set({ rules: currentRules });
        renderRules(currentRules);
    }

    // --- Event Listeners ---

    addWhitelistBtn.addEventListener('click', () => {
        addDomain(whitelistInput.value.trim());
    });

    whitelistInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addDomain(whitelistInput.value.trim());
    });

    addRuleBtn.addEventListener('click', () => {
        addRule(ruleDomainInput.value.trim(), ruleNameInput.value.trim());
    });

    clearSessionsBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all saved sessions? This cannot be undone.')) {
            await chrome.storage.local.set({ sessions: [] });
            alert('Sessions cleared.');
        }
    });

    restoreDefaultsBtn.addEventListener('click', async () => {
        if (confirm('Restore default whitelist? This will merge defaults with your current list.')) {
            const defaultWhitelist = [
                'github.com', 'google.com', 'docs.google.com', 'drive.google.com',
                'meet.google.com', 'mail.google.com', 'localhost', 'stackoverflow.com',
                'chatgpt.com', 'claude.ai', 'notion.so', 'linear.app',
                'figma.com', 'slack.com', 'outlook.office.com', 'teams.microsoft.com'
            ];
            const { whitelist } = await chrome.storage.local.get(['whitelist']);
            const currentList = whitelist || [];

            // Merge unique
            const newList = [...new Set([...currentList, ...defaultWhitelist])];

            await chrome.storage.local.set({ whitelist: newList });
            renderWhitelist(newList);
            alert('Defaults restored and merged.');
        }
    });
});
