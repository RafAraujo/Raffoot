class Router {
    static views = new Map();

    static addView(module, vueInstance, alwaysVisible = false) {
        const view = {
            module: module,
            name: vueInstance.name,
            vueInstance: vueInstance,
            alwaysVisible: alwaysVisible
        };

        Router.views.set(view.name, view);
    }

    static get(viewName) {
        const view = Router.views.get(viewName);
        return view.vueInstance.mounted;
    }

    static goTo(viewName, forceUpdate = false) {
        const view = Router.views.get(viewName);
        if (forceUpdate)
            view.vueInstance.mounted.$forceUpdate();
        Router._hideViews();
        Router._showView(view);
    }

    static _hideViews() {
        for (const view of Router.views.values()) {
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