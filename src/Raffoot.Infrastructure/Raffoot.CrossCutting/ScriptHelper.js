class ScriptHelper {
    static async load(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            document.documentElement.appendChild(script);

            script.onload = resolve;

            script.onerror = () => reject('Error loading script');
        });
    }
}