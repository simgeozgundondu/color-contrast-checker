import { ContrastChecker } from './components/ContrastChecker.js';
import { hexToRgb } from './utils/colorUtils.js';
import { luminance } from './utils/wcagUtils.js';

document.addEventListener('DOMContentLoaded', () => {

    function checkColors() {
        document.getElementById('checkColorsButton').style.display = "none";
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const url = currentTab.url;
        
            // Don't perform transactions on sites other than Coolors
            if (url && url.includes("coolors.co/")) {
                chrome.tabs.sendMessage(currentTab.id, { action: 'getColors' }, (response) => {
                    if (chrome.runtime.lastError) {
                        displayError('Please make sure you are displaying the one color palette!!!');
                        return;
                    }
                    if (response && response.colors) {
                        const checker = new ContrastChecker(response.colors);
                        const results = checker.getContrastResults();
                        displayResults(results);
                    }
                });
            } else {
                displayError('This feature only works on Coolors palette pages!!!.');
            }
        });
    }
    function displayError(message) {
        const colorChecker = document.getElementById('colorChecker');
        colorChecker.style.display = 'none';
    
        const errorMessageDiv = document.getElementById('errorMessage');
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.innerHTML = '';
        
        const alertImg = document.createElement('img');
        alertImg.src = chrome.runtime.getURL('../public/icons/alert.png');
        alertImg.alt = 'alert'
        errorMessageDiv.appendChild(alertImg);
        errorMessageDiv.appendChild(document.createTextNode(message));
    }
    

    function getTextColorForBackground(hexColor) {
        const [r, g, b] = hexToRgb(hexColor);
        const luminanceValue = luminance(r, g, b);
        return luminanceValue > 0.5 ? '#000000' : '#FFFFFF';
    }

    function displayResults(results) {
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = results.map(result => {
                const textColor1 = getTextColorForBackground(result.color1);
                const textColor2 = getTextColorForBackground(result.color2);
                const contrastRatio = parseFloat(result.ratio);

                const maxStars = 5;
                const fullStars = Math.max(0, Math.min(Math.floor(contrastRatio / 1.5), maxStars));
                const emptyStars = maxStars - fullStars;

                const stars = `
                    ${'<i class="fas fa-star full-star"></i>'.repeat(fullStars)}
                    ${'<i class="far fa-star empty-star"></i>'.repeat(emptyStars)}
                `;

                return `
                    <div class="result-item">
                        <p class="result-text">
                            <span class="color" style="background-color: #${result.color1};">
                                <span class="color-text" style="color: ${textColor1};">#${result.color1}</span>
                            </span>
                            <span class="color" style="background-color: #${result.color2};">
                                <span class="color-text" style="color: ${textColor2};">#${result.color2}</span>
                            </span>
                            <br>
                            <p class="contrast-status ${result.compliant ? 'pass' : 'fail'}">
                                ${result.compliant ? '🚀Excellent Contrast' : 'Bad Contrast!!'}
                                <br>
                                <span class="stars">${stars}</span>
                            </p>
                        </p>
                    </div>
                `;
            }).join('');
        }
    }

    document.getElementById('checkColorsButton').addEventListener('click', checkColors);
});
