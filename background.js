// TabTidy Background Script
console.log("TabTidy Service Worker Loaded");

chrome.runtime.onInstalled.addListener(() => {
    console.log("TabTidy installed");
    // Initialize storage if needed
    chrome.storage.local.get(['sessions', 'rules', 'whitelist'], (result) => {
        if (!result.sessions) {
            chrome.storage.local.set({ sessions: [] });
        }
        if (!result.rules) {
            chrome.storage.local.set({ rules: [] });
        }
        if (!result.whitelist) {
            // Default work domains
            chrome.storage.local.set({
                whitelist: [
                    'github.com',
                    'google.com',
                    'docs.google.com',
                    'drive.google.com',
                    'meet.google.com',
                    'mail.google.com',
                    'localhost',
                    'stackoverflow.com',
                    'chatgpt.com',
                    'claude.ai',
                    'notion.so',
                    'linear.app',
                    'figma.com',
                    'slack.com',
                    'outlook.office.com',
                    'teams.microsoft.com'
                ]
            });
        }
    });
});
