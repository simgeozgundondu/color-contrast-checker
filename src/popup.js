import { ContrastChecker } from './components/ContrastChecker.js';
import { hexToRgb } from './utils/colorUtils.js';
import { luminance } from './utils/wcagUtils.js';

document.addEventListener('DOMContentLoaded', () => {

    function checkColors() {
        document.getElementById('checkColorsButton').style.display = "none";
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getColors' }, (response) => {
                if (response && response.colors) {
                    const checker = new ContrastChecker(response.colors);
                    const results = checker.getContrastResults();
                    displayResults(results);
                } else {
                    const errorMessageDiv = document.getElementById('errorMessage');
                    const colorChecker = document.getElementById('colorChecker');
                    colorChecker.style.display = 'none';
                    errorMessageDiv.style.display = 'block';
                    errorMessageDiv.textContent = 'Please make sure you are displaying the one color palette!!!';
                }
            });
        });
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
