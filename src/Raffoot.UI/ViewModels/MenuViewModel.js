class MenuViewModel {
    constructor(game, translator, generalViewModel) {
        this.game = game;
        this.translator = translator;
        this.generalViewModel = generalViewModel;
        this.gameService = new GameService();

        this.activeSection = 'play';
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
        Router.goTo(section);
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