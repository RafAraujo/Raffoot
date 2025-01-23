class ColorsModalViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    setTheme(theme, saveLocalStorage = false) {
        this.game.config.theme = theme;
        document.documentElement.setAttribute('data-bs-theme', theme);
        if (saveLocalStorage)
            localStorage.setItem('theme', theme);
    }

    resetColors() {
        this.game.club.resetColors();
        this.setColors();
    }

    setBackground(color) {
        this.game.club.colors.backgroundCustom = color;
        document.body.style.backgroundColor = color;
    }

    setForeground(color) {
        this.game.club.colors.foregroundCustom = color;
        document.body.style.color = color;
    }

    setColors() {
        if (!this.game.config.useClubColors) {
            document.body.style.backgroundColor = null;
            document.body.style.color = null;
            return;
        }

        if (this.game.club.colors.backgroundCustom)
            document.body.style.backgroundColor = this.game.club.colors.backgroundCustom;
        if (this.game.club.colors.foregroundCustom)
            document.body.style.color = this.game.club.colors.foregroundCustom;
    }
}