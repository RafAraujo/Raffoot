class ColorsModalViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.colors = { background: this.game.club.colors.backgroundCustom, foreground: this.game.club.colors.foregroundCustom };
        this.theme = 'dark';
    }

    resetColors() {
        this.game.club.resetColors();
        this.colors = { background: this.game.club.colors.backgroundCustom, foreground: this.game.club.colors.foregroundCustom };
    }

    saveChanges() {
        this.game.club.colors.backgroundCustom = this.colors.background;
        this.game.club.colors.foregroundCustom = this.colors.foreground;
        this.setColors();
    }

    setColors() {
        document.body.style.backgroundColor = this.game.club.colors.backgroundCustom;
        document.body.style.color = this.game.club.colors.foregroundCustom;
        this.theme = this.game.club.colors.foregroundCustom === '#000000' ? 'dark' : 'light';
    }
}