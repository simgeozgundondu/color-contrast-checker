import { ContrastChecker } from './components/ContrastChecker.js';
import { hexToRgb } from './utils/colorUtils.js';
import { luminance} from './utils/wcagUtils.js';
document.addEventListener('DOMContentLoaded', () => {

    function checkColors() {
        document.getElementById('checkColorsButton').style.display="none";
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getColors' }, (response) => {
                if (response && response.colors) {
                    const checker = new ContrastChecker(response.colors);
                    const results = checker.getContrastResults();
                    displayResults(results);
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
                                
                                ${result.compliant ? 'Excellent Contrast' : 'Bad Contrast'}
                            </p>
                        </p>
                    </div>

                `;
            }).join('');
        }
    }
    
    

    document.getElementById('checkColorsButton').addEventListener('click', checkColors);
});
