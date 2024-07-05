class MatchesSectionViewModel {
    constructor(game, translator) {
        this.controller = new MatchesSectionController(game, translator);
    }

    getCurrentDateChampionshipEditions() {
        return this.controller.getCurrentDateChampionshipEditions();
    }
}