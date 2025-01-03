class VueInstance {
    constructor(selector, viewModel) {
        this._t0 = null;

        this.selector = selector;
        this.viewModel = viewModel;
        this.object = null;
        this.app = null;
        this.mounted = null;
    }

    get name() {
        return this.selector.substring(1);
    }

    createApp() {
        this.object = this.createObject();
        this.object.computed = this.computed();
        this.object.beforeUpdate = this._beforeUpdate;
        this.object.updated = this._updated;
        this.app = Vue.createApp(this.object);
        return this;
    }

    computed() {
        return {
            currentMatch() {
                return this.game.getCurrentMatch();
            },
            currentOpponent() {
                return this.currentMatch?.getOpponent(this.game.club);
            }
        };
    }

    createObject() {
        const clone = { ...this.viewModel };
        const methods = {};

        for (const method of Object.getOwnPropertyNames(Object.getPrototypeOf(this.viewModel))) {
            if (method === 'constructor')
                continue;
            methods[method] = this.viewModel[method];
        }

        const object = {
            data() {
                return clone;
            },
            methods: methods
        };

        return object;
    }

    mount() {
        this.mounted = this.app.mount(this.selector);
        this.app._instance.data.name = this.name;
        return this;
    }

    _beforeUpdate() {
        this._t0 = performance.now();
    }

    _updated() {
        if (this.updated)
            this.updated();

        const time = performance.now() - this._t0;
        const message = `[${this.name}] Update took ${time} milliseconds.`;
        console.log(message);
        if (location.search.includes('mock'))
            alert(message);
    }
}