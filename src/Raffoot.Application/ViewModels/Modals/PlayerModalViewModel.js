class PlayerModalViewModel {
    constructor(game, translator, htmlId) {
        this.game = game;
        this.translator = translator;

        this.htmlId = htmlId;
        this.player = null;
    }

    show(player) {
        this.player = player;
        const modal = new bootstrap.Modal(document.getElementById(this.htmlId));
        modal.show();
    }
}