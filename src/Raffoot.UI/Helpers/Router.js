class Router {
    static views = [];

    static addView(module, vueInstance, alwaysVisible = false) {
        const view = {
            module: module,
            name: vueInstance.name,
            vueInstance: vueInstance,
            alwaysVisible: alwaysVisible
        };

        Router.views.push(view);
    }

    static get(viewName) {
        const view = Router.views.find(v => v.name === viewName);
        return view.vueInstance.mounted;
    }

    static goTo(viewName) {
        const view = Router.views.find(v => v.name === viewName);
        Router._hideViews();
        Router._showView(view);
    }

    static _hideViews() {
        for (const view of Router.views) {
            Common.hideElement(view.module);
            if (!view.alwaysVisible)
                Common.hideElement(view.vueInstance.selector);
        }
    }

    static _showView(view) {
        Common.showElement(view.module);
        Common.showElement(view.vueInstance.selector);
    }
}