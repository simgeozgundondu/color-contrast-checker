// Function to extract hex color codes from the Coolors page
function extractColors() {
    const colorElements = document.querySelectorAll('.palette-big_value'); // Adjust selector if needed
    const hexColors = Array.from(colorElements).map(el => el.textContent.trim());
    return hexColors;
}

// Send hex colors to the background script
console.log('Content script running');
const hexColors = extractColors();
console.log('Extracted colors:', hexColors);
chrome.runtime.sendMessage({ action: 'sendHexColors', data: hexColors });

