class ColorHelper {   
    static getTextColorBasedOnBackground(hex) {
        const [r, g, b] = ColorHelper.hexToRgb(hex);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    static hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        let bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return [r, g, b];
    }
}