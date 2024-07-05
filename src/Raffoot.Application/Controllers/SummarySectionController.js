class SummarySectionController {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getGameClubConfederation() {
        const countryId = this.game.club?.country.id;
        let confederation = this.game.confederations.find(conf => conf.countries.map(c => c.id).includes(countryId));
        if (!confederation) {
            confederation = this.game.confederations[0];
        }
        return confederation;
    }

    getConfederations() {
        const confederations = this.game.currentSeason
            .getCurrentDateChampionshipEditions()
            .map(ce => ce.championship.confederation)
            .distinct()
            .map(c => ({ id: c.id, name: this.translator.get(c.name) }))
            .orderBy('name');
        return confederations;
    }

    getCurrentDateChampionshipEditions(confederationId) {
        const championshipEditions = this.game.currentSeason
            .getCurrentDateChampionshipEditions()
            .filter(ce => ce.championship.confederation.id == confederationId)
        return championshipEditions;
    }
}