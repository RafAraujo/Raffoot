class ColorsModalViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.colors = { background: this.game.club.colors.backgroundCustom, foreground: this.game.club.colors.foregroundCustom };
    }

    resetColors() {
        this.game.club.resetColors();
        this.colors = { background: this.game.club.colors.backgroundCustom, foreground: this.game.club.colors.foregroundCustom };
        this.setColors();
    }

    setBackground(color) {
        this.colors.background = color;
        this.game.club.colors.backgroundCustom = this.colors.background;
        document.body.style.backgroundColor = color;
    }

    setForeground(color) {
        this.colors.foreground = color;
        this.game.club.colors.foregroundCustom = this.colors.foreground;
        document.body.style.color = color;
    }

    setColors() {
        if (!this.game.config.useClubColors) {
            document.body.style.backgroundColor = null;
            document.body.style.color = null;
            return;
        }

        document.body.style.backgroundColor = this.game.club.colors.backgroundCustom;
        document.body.style.color = this.game.club.colors.foregroundCustom;
    }
}