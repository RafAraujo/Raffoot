class Common {
    static getQueryString(parameter) {
        const urlParams = new URLSearchParams(location.search);
        const id = urlParams.get(parameter);
        return id;
    }

    static loadDefaultPlayerPhoto(event) {
        event.target.src = Config.files.defaultPlayerPhoto;
    }

    static playAudio() {
        new Audio('res/sound/goal.wav').play();
    }

    static showMessage(text, type) {
        const element = document.getElementById('message');
        element.classList.remove(...element.classList);
        element.classList.add('alert', 'alert-dismissible', 'fade', 'show', `alert-${type}`);
        const span = element.querySelector('span');
        span.innerText = text;
    }

    static hideMessage() {
        const element = document.getElementById('message');
        element.classList.add('d-none');
    }
}