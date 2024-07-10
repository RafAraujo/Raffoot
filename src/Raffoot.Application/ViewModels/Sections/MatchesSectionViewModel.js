class MatchesSectionViewModel {
    constructor(game, translator) {
        this.controller = new MatchesSectionController(game, translator);
    }

    getChampionshipEditionCurrentStageMessage(championshipEdition) {
        return this.controller.getChampionshipEditionCurrentStageMessage(championshipEdition);
    }

    getCurrentChampionshipEditions() {
        return this.controller.getCurrentChampionshipEditions();
    }
}