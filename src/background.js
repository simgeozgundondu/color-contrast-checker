chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message);
    if (message.action === 'sendHexColors') {
        chrome.storage.local.set({ hexColors: message.data }, () => {
            console.log('Hex colors saved:', message.data);
        });
    }
});
