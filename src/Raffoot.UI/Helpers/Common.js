class Common {
    static toast = null;

    static cloneElement(sourceElementSelector, destinationElementSelector, arrayIdToChange = [], idPrefixToInclude = null) {
        const sourceElement = document.querySelector(sourceElementSelector);
        const clone = sourceElement.cloneNode(true);
        Common.includePrefixInIds(clone, arrayIdToChange, idPrefixToInclude);
        const destinationElement = document.querySelector(destinationElementSelector);
        destinationElement.appendChild(clone);
    }

    static getQueryString(parameter) {
        const urlParams = new URLSearchParams(location.search);
        const id = urlParams.get(parameter);
        return id;
    }

    static hideElement(selector) {
        const element = document.querySelector(selector);
        element.classList.add('d-none');
    }

    static hideMessage() {
        const element = document.getElementById('message');
        element.classList.add('d-none');
    }

    static includePrefixInIds(element, arrayId, idPrefix) {
        for (const id of arrayId) {
            const child = element.querySelector(`#${id}`);
            child.id = idPrefix.concat(child.id);
        }
    }

    static loadDefaultPlayerPhoto(event) {
        event.target.src = Config.files.defaultPlayerPhoto;
    }

    static playAudio() {
        new Audio('res/sound/goal.wav').play();
    }

    static showElement(selector) {
        const element = document.querySelector(selector);
        element.classList.remove('d-none');
    }

    static showMessage(text, type) {
        const element = document.getElementById('message');
        element.classList.remove(...element.classList);
        element.classList.add('alert', 'alert-dismissible', 'fade', 'show', `alert-${type}`);
        const span = element.querySelector('span');
        span.innerText = text;
    }

    static showToast(text, type) {
        const element = document.getElementById('toast');
        element.classList.remove(...element.classList);
        element.classList.add('toast', 'align-items-center', `text-bg-${type}`, 'border-0');
        const body = element.querySelector('.toast-body');
        body.innerText = text;
        if (!Common.toast)
            Common.toast = new bootstrap.Toast(element);
        Common.toast.show();
    }
}