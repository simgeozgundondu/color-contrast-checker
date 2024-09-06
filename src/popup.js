import { ContrastChecker } from './components/ContrastChecker.js';

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('hexColors', (result) => {
        const hexColors = result.hexColors || [];
        if (hexColors.length) {
            const checker = new ContrastChecker(hexColors);
            const results = checker.getContrastResults();
            displayResults(results);
        } else {
            document.getElementById('results').innerHTML = '<p class="text-red-600">No colors found. Please make sure to extract colors from the Coolors page.</p>';
        }
    });

    function displayResults(results) {
        const resultDiv = document.getElementById('results');
        resultDiv.innerHTML = results.map(result => `
            <div class="flex flex-col items-center justify-center p-4 my-2 w-64 bg-white rounded-lg shadow-md">
                <p class="text-lg font-semibold text-gray-800">
                    <span class="text-blue-500">${result.color1}</span> -
                    <span class="text-blue-500">${result.color2}</span><br>
                    <p class="text-center">Contrast Value: <span class="font-bold">${result.ratio}</span></p>
                </p>
                <p class="text-md font-bold ${result.compliant ? 'text-green-600' : 'text-red-600'}">
                    ${result.compliant ? 'Pass' : 'Fail'}
                </p>
            </div>
        `).join('');
    }
});
