class StandingSectionController {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getConfederations() {
        const confederations = this.game.confederations
            .map(c => ({ id: c.id, name: this.translator.get(c.name) }))
            .orderBy('name');
        return confederations;
    }

    getChampionshipEditionsByConfederation(confederationId) {
        const championshipEditions = this.game.currentSeason
            .getChampionshipEditionsByConfederation(confederationId)
            .map(ce => ({
                id: ce.id,
                importance: ce.championship.importance,
                name: this.translator.getChampionshipName(ce.championship)
            }))
            .orderBy('-importance', 'name');
        
        return championshipEditions;
    }

    getInternationalChampionshipEditions() {
        const championshipEditions = this.game.currentSeason
            .getInternationalChampionshipEditions()
            .map(ce => ({
                id: ce.id,
                importance: ce.championship.importance,
                name: this.translator.getChampionshipName(ce.championship)
            }))
            .orderBy('-importance', 'name');
        
        return championshipEditions;
    }

    getClubNationalLeague() {
        return this.game.getClubNationalLeague();
    }
}