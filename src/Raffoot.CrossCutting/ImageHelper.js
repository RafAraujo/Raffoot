class ImageHelper {
    static async create(src, alt = null, title = null, urlAlternative = null) {
        return new Promise((resolve) => {
            let image = new Image();

            image.onload = () => resolve(image);

            image.onerror = () => {
                if (urlAlternative) {
                    image.onerror = () => { }
                    image.src = urlAlternative;
                }
            };

            image.src = src;

            if (alt) {
                image.alt = alt;
            }
            if (title) {
                image.title = title;
            }
        });
    }

    static async convertToDataURL(url) {
        let response = await fetch(url);
        let blob = response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            
            reader.readAsDataURL(blob);
        });
    }
}