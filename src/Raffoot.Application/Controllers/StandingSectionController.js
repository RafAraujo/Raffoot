class StandingSectionController {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getClubNationalLeague() {
        return this.game.getClubNationalLeague();
    }
}