class VueInstance {
    constructor(viewModel) {
        this._t0 = null;

        this.viewModel = viewModel;
        this.object = null;
        this.app = null;
        this.mounted = null;
    }

    createApp() {
        this.object = this.createObject(this.viewModel);
        this.object.beforeUpdate = this._beforeUpdate;
        this.object.updated = this._updated;
        this.app = Vue.createApp(this.object);
        return this;
    }

    createObject(viewModel) {
        const object = {
            data() {
                return {
                    vm: viewModel
                }
            },
        };

        return object;
    }

    mount(selector) {
        this.mounted = this.app.mount(selector);
        this.app._instance.data.name = selector.substring(1);
        return this;
    }

    _beforeUpdate() {
        this._t0 = performance.now();
    }

    _updated() {
        const time = performance.now() - this._t0;
        console.log(`[${this.name}]`, `Update took ${time} milliseconds.`);
    }
}