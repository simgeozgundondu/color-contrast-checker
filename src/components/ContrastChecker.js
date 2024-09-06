import { hexToRgb } from '../utils/colorUtils.js';
import { calculateContrast, checkWcagCompliance } from '../utils/wcagUtils.js';

export class ContrastChecker {
    constructor(colors) {
        this.colors = colors;
    }

    getContrastResults() {
        const results = [];
        for (let i = 0; i < this.colors.length; i++) {
            for (let j = i + 1; j < this.colors.length; j++) {
                const rgb1 = hexToRgb(this.colors[i]);
                const rgb2 = hexToRgb(this.colors[j]);
                const contrastRatio = calculateContrast(rgb1, rgb2).toFixed(2);
                const isCompliant = checkWcagCompliance(contrastRatio);
                results.push({
                    color1: this.colors[i],
                    color2: this.colors[j],
                    ratio: contrastRatio,
                    compliant: isCompliant
                });
            }
        }
        return results;
    }
}
