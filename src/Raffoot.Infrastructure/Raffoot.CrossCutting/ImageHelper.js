class ImageHelper {
    static async create(src, alt = null, title = null, urlAlternative = null) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => resolve(image);

            image.onerror = () => {
                if (!urlAlternative)
                    reject('Error loading image');

                image.onerror = () => reject('Error loading alternative image');
                image.src = urlAlternative;
            };

            image.src = src;

            if (alt)
                image.alt = alt;

            if (title)
                image.title = title;
        });
    }

    static async convertToDataURL(url) {
        const response = await fetch(url);
        const blob = response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject

            reader.readAsDataURL(blob);
        });
    }

    static exists(url) {
        try {
            const img = new Image();
            img.src = url;
            return img.height != 0;
        }
        catch (error) {
            return false;
        }
    }
}