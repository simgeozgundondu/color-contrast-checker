export function luminance(r, g, b) {
    const a = [r, g, b].map(v => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    //The weights here are determined based on how sensitive the human eye is to different colors: 
    //0.2126 for red, 0.7152 for green, and 0.0722 for blue.
  }
  
  export function calculateContrast(rgb1, rgb2) {
    const lum1 = luminance(...rgb1);
    const lum2 = luminance(...rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }
  
  export function checkWcagCompliance(contrastRatio, threshold = 4.5) {
    //threshold: The minimum contrast ratio required for WCAG compliance. It’s set to 4.5 by default.
    return contrastRatio >= threshold;
  }
  