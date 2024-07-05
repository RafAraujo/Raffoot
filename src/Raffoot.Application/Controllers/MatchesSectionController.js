class MatchesSectionController {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getCurrentDateChampionshipEditions() {
        const confederation = this.game.confederations.find(confederation => confederation.countries.map(c => c.id).includes(this.game.club.country.id));
        const championshipEditions = this.game.currentSeason.getCurrentDateChampionshipEditions().filter(ce => ce.championship.confederation.id === confederation.id);
        return championshipEditions;
    }
}