class CanvasHelper {
    static getTextWidth(text, font = null) {
        const canvas = CanvasHelper.canvas ?? (CanvasHelper.canvas = document.createElement('canvas'));
        const context = canvas.getContext('2d');
        context.font = font ?? this.getCanvasFont();
        const metrics = context.measureText(text);
        return metrics.width;
    }

    static getCssStyle(element, prop) {
        return window.getComputedStyle(element, null).getPropertyValue(prop);
    }

    static getCanvasFont(el = document.body) {
        const fontWeight = this.getCssStyle(el, 'font-weight') || 'normal';
        const fontSize = this.getCssStyle(el, 'font-size') || '16px';
        const fontFamily = this.getCssStyle(el, 'font-family') || 'Times New Roman';

        return `${fontWeight} ${fontSize} ${fontFamily}`;
    }


    static async createFromImageURL(url, width = null, height = null, sx = null, sy = null, sw = null, sh = null, dx = null, dy = null, dw = null, dh = null) {
        const image = await ImageHelper.create(url);
        return this.createFromImage(image, width = null, height = null, sx = null, sy = null, sw = null, sh = null, dx = null, dy = null, dw = null, dh = null);
    }

    static createFromImage(image, width = null, height = null, sx = null, sy = null, sw = null, sh = null, dx = null, dy = null, dw = null, dh = null) {
        width ??= image.naturalWidth;
        height ??= image.naturalHeight;
        sx ??= 0;
        sy ??= 0;
        sw ??= image.naturalWidth;
        sh ??= image.naturalHeight;
        dx ??= 0;
        dy ??= 0;
        dw ??= image.naturalWidth;
        dh ??= image.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);

        return canvas;
    }

    static createFromImageCropped(image, newWidthPercentage = 0, newHeightPercentage = 0) {
        const croppedWidth = image.naturalWidth * newWidthPercentage;
        const croppedHeight = image.naturalWidth * newHeightPercentage;

        const width = image.naturalWidth - croppedWidth;
        const height = image.naturalWidth - croppedHeight;

        const sx = croppedWidth / 2;
        const sy = croppedHeight / 2;

        const canvas = this.createFromImage(image, width, height, sx, sy);
        return canvas;
    }
}