class SummarySectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.selectedConfederationId = this.getGameClubConfederation().id;
        this.selectedMatchId = null;
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
            .getCurrentChampionshipEditions()
            .map(ce => ce.championship.confederation)
            .distinct()
            .map(c => ({ id: c.id, name: this.translator.get(c.name) }))
            .orderBy('name');

        return confederations;
    }

    getCurrentChampionshipEditions() {
        const championshipEditions = this.game.currentSeason
            .getCurrentChampionshipEditions()
            .filter(ce => ce.championship.confederation.id == this.selectedConfederationId);

        return championshipEditions;
    }

    getCurrentMatchesByChampionshipEdition(championshipEdition) {
        const matches = this.game.currentSeason.getCurrentMatchesByChampionshipEdition(championshipEdition);
        return matches;
    }

    selectConfederation(confederationId) {
        this.selectedConfederationId = parseInt(confederationId);
    }

    selectMatch(matchId) {
        this.selectedMatchId = matchId;
    }
}