class MenuViewModel {
    constructor(game, translator, generalViewModel) {
        this.game = game;
        this.translator = translator;
        this.generalViewModel = generalViewModel;
        this.gameService = new GameService();
        this.activeSection = 'play';
    }

    exitGame() {
        location.href = 'index.html';
    }

    exportGame() {
        const compressed = this.gameService.compress(this.game);
        const blob = new Blob([compressed], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', this.game.name + ".raffoot");
        link.click();
    }

    getMenu() {
        const menu = {
            'Play': { section: 'play', icon: 'play' },
            'Squad': { section: 'squad', icon: 'people-group' },
            'Calendar': { section: 'calendar', icon: 'calendar', action: () => { Router.get('calendar').reset() }, forceUpdate: true },
            'Standings': {section: 'standings', icon: 'table-list' },
            'Finances': { section: 'finances', icon: 'sack-dollar' },
            'Clubs': { section: 'clubs', icon: 'shield-halved' },
            'Players': { section: 'players', icon: 'user' },
            'History': {
                icon: 'book',
                subItems: [
                    {'Champions': { section: 'champions', icon: 'trophy' } },
                    {'Top scorers': { section: 'top-scorers', icon: 'futbol', action: this.goToSection.bind(this, 'top-scorers', true) } },
                    {'Classification': { section: 'classification', icon: 'ranking-star', separator: true } },
                ]
            },
            'Options': {
                icon: 'gear',
                subItems: [
                    {'Save game': { icon: 'floppy-disk', action: this.saveAsync.bind(this) } },
                    {'Export game': { icon: 'file-export', action: this.exportGame.bind(this) } },
                    {'Preferences': { icon: 'sliders', modal: 'modal-preferences', separator: true } },
                    {'Language': { icon: 'language', modal: 'modal-language' } },
                    {'Colors': { icon: 'palette', modal: 'modal-colors' } },
                    {'Fullscreen': { icon: 'up-right-and-down-left-from-center', action: this.toggleFullscreen } },
                    {'Exit game': { icon: 'power-off', separator: true, action: this.exitGame } },
                ]
            },
        }

        const items = Object.entries(menu).map(([key, value]) => ({
            name: key,
            section: value.section,
            icon: value.icon,
            action: () => {
                if (value.action)
                    value.action();
                this.goToSection(value.section, value.forceUpdate);
            },
            subItems: (value.subItems ?? []).flatMap(subItem => Object.entries(subItem).map(([subItemKey, subItemValue]) => ({
                name: subItemKey,
                section: subItemValue.section,
                icon: subItemValue.icon,
                modal: subItemValue.modal,
                action: subItemValue.action ?? (() => {}),
                separator: subItemValue.separator,
            })))
        }));

        return items;
    }

    goToSection(section, forceUpdate) {
        this.activeSection = section;
        for (const element of document.getElementsByClassName('nav-link dropdown-toggle show'))
            element.click();
        this.toggleCollapse();
        Router.goTo(section, forceUpdate);
    }

    async saveAsync() {
        await this.gameService.saveAsync(Vue.toRaw(this.game));
        Common.showMessage(this.translator.get('Game saved successfully'), 'success');
    }

    toggleFullscreen() {
        if (document.fullscreenElement)
            document.exitFullscreen();
        else
            document.documentElement.requestFullscreen();
    }
    
    toggleCollapse() {
        const collapseElement = document.querySelector('.navbar-collapse.collapse');
        if (collapseElement.classList.contains('show')) {
            const collapse = new bootstrap.Collapse(collapseElement);
        }
    }
}