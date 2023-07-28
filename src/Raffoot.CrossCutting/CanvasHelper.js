class CanvasHelper {
    static async createFromImageURL(url, width = null, height = null, sx = null, sy = null, sw = null, sh = null, dx = null, dy = null, dw = null, dh = null) {
        let image = await ImageHelper.create(url);
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

        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        let ctx = canvas.getContext("2d");
        ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);

        return canvas;
    }

    static createFromImageCropped(image, newWidthPercentage = 0, newHeightPercentage = 0) {
        let croppedWidth = image.naturalWidth * newWidthPercentage;
        let croppedHeight = image.naturalWidth * newHeightPercentage;

        let width = image.naturalWidth - croppedWidth;
        let height = image.naturalWidth - croppedHeight;

        let sx = croppedWidth / 2;
        let sy = croppedHeight / 2;

        let canvas = this.createFromImage(image, width, height, sx, sy);
        return canvas;
    }
}