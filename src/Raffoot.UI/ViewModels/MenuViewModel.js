class MenuViewModel {
    constructor(game, translator, generalViewModel) {
        this.game = game;
        this.translator = translator;
        this.generalViewModel = generalViewModel;
        this.gameService = new GameService();

        this.activeSection = 'play';
        this.sections = ['play', 'squad', 'calendar', 'standings', 'finances', 'clubs', 'players', 'champions', 'top-scorers', 'ranking'];
    }

    exportGame() {
        const compressed = gameService.compress(game);

        const blob = new Blob([compressed], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', game.name + ".raffoot");
        link.click();
    }

    goToSection(section) {
        this.activeSection = section;
        for (const element of document.getElementsByClassName('nav-link dropdown-toggle show'))
            element.click();
        this.toggleCollapse();
        this.hideAllSections();
        document.getElementById(section).classList.remove('d-none');
    }

    hideAllSections() {
        for (const section of this.sections) {
            document.getElementById(section)?.classList.add('d-none');
        }
    }

    async saveAsync() {
        await this.gameService.saveAsync(Vue.toRaw(this.game));
        Common.showMessage(this.translator.get('Game saved successfully'), 'success');
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        else {
            document.documentElement.requestFullscreen();
        }
    }
    
    toggleCollapse() {
        const collapseElement = document.querySelector('.navbar-collapse.collapse');
        if (collapseElement.classList.contains('show')) {
            const collapse = new bootstrap.Collapse(collapseElement);
        }
    }
}