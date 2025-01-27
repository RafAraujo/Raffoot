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
        if (this.viewModel.watch)
            this.object.watch = this.viewModel.watch;
        this.app = Vue.createApp(this.object);
        return this;
    }

    computed() {
        let computed = {
            currentMatch() {
                return this.game.getCurrentMatch();
            },
            currentOpponent() {
                return this.currentMatch?.getOpponent(this.game.club);
            }
        };

        if (this.viewModel.computed)
            computed = Object.assign(computed, this.viewModel.computed());

        return computed;
    }

    createObject() {
        const methods = {};

        let obj = this.viewModel;

        while (obj && obj !== Object.prototype) {
            let props = Object.getOwnPropertyNames(obj);
            for (const prop of props)
                if (typeof obj[prop] === 'function' && prop !== 'constructor')
                    methods[prop] = this.viewModel[prop];
            obj = Object.getPrototypeOf(obj);
        }

        const clone = { ...this.viewModel };

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