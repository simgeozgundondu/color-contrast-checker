import { ContrastChecker } from './components/ContrastChecker.js';
import { hexToRgb } from './utils/colorUtils.js';
import { luminance } from './utils/wcagUtils.js';

document.addEventListener('DOMContentLoaded', () => {

    function checkColors() {
        document.getElementById('checkColorsButton').style.display = "none";
        document.querySelector('.filter-checkbox').style.display = "flex";

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
            resultsDiv.innerHTML = results
                .map(result => {
                    const textColor1 = getTextColorForBackground(result.color1);
                    const textColor2 = getTextColorForBackground(result.color2);
                    const ratioBackgroundColor = result.compliant ? '#00A806' : '#C51A00';

                    return `
                        <div class="result-item" data-compliant="${result.compliant}">
                            <div class="result-content">
                                <div class="result-color">
                                    <div class="color-container">
                                        <span class="color" style="background-color: #${result.color1};" data-color="${result.color1}">
                                            <span class="color-text-hover" style="color: ${textColor1};"><i class="fa-regular fa-copy"></i></span>
                                            <span class="checkmark"><i class="fas fa-check"></i></span>
                                        </span>
                                        <span class="color-text">#${result.color1}</span>    
                                    </div>
                                    <div class="color-container">
                                        <span class="color" style="background-color: #${result.color2};" data-color="${result.color2}">
                                            <span class="color-text-hover" style="color: ${textColor2};"><i class="fa-regular fa-copy"></i></span>
                                            <span class="checkmark"><i class="fas fa-check"></i></span>
                                        </span>
                                        <span class="color-text">#${result.color2}</span>    
                                    </div>
                                </div>
    
                                <div class="result-ratio">
                                    <div class="result-examples">
                                        <div class="result-example" style="background-color:#${result.color1}" ">
                                            <p style="color:#${result.color2}">Lorem</p>
                                        </div>
                                        <div class="result-example" style="background-color:#${result.color2}" >
                                            <p style="color:#${result.color1}">Lorem</p>
                                        </div>
                                    </div>
                                    <p class="result-text">
                                        <span class="contrast-ratio" style="background-color: ${ratioBackgroundColor}">
                                            <span class="tooltip">
                                                <i class="fa-solid fa-circle-info"></i>
                                                <span class="tooltiptext">Contrast Ratio</span>
                                            </span>
                                            <span style="font-weight:bold">${result.ratio}<span/>
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

            // Add click event listeners to color spans
            document.querySelectorAll('.color').forEach(colorSpan => {
                colorSpan.addEventListener('click', () => {
                    const colorCode = colorSpan.getAttribute('data-color');
                    navigator.clipboard.writeText(`${colorCode}`).then(() => {
                        const checkmark = colorSpan.querySelector('.checkmark');
                        if (checkmark) {
                            colorSpan.classList.add('copied');
                            checkmark.style.display = 'block';
                            setTimeout(() => {
                                checkmark.style.display = 'none';
                                colorSpan.classList.remove('copied');
                            }, 2000);
                        }
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
                });
            });

            document.getElementById('showCompliant').addEventListener('change', () => {
                filterResults();
            });
        }
    }

    function filterResults() {
        const showCompliant = document.getElementById('showCompliant').checked;
        const results = document.querySelectorAll('.result-item');

        results.forEach(result => {
            const isCompliant = result.getAttribute('data-compliant') === 'true';
            result.style.display = showCompliant && !isCompliant ? 'none' : '';
        });
    }

    document.getElementById('checkColorsButton').addEventListener('click', checkColors);
});
