function extractColors() {
    const colorElements = document.querySelectorAll('.palette-big_value');
    return Array.from(colorElements).map(el => el.textContent.trim());
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getColors') {
        const colors = extractColors();
        sendResponse({ colors });
    }
});
