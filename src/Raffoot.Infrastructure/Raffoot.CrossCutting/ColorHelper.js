class ColorHelper {
    static areSimilar(hex1, hex2, threshold = 50) {
        const [r1, g1, b1] = this.hexToRgb(hex1);
        const [r2, g2, b2] = this.hexToRgb(hex2);
        const difference = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
        return difference < threshold;
    }

    static getTextColorBasedOnBackground(hex) {
        const [r, g, b] = ColorHelper.hexToRgb(hex);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    static hexToRgb(hex) {
        const color = parseInt(hex.substring(1), 16);
        const r = color >> 16;
        const g = (color - (r << 16)) >> 8;
        const b = color - (r << 16) - (g << 8);
        return [r, g, b];
    }
}