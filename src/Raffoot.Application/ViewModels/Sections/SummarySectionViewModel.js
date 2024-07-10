class SummarySectionViewModel {
    constructor(game, translator) {
        this.controller = new SummarySectionController(game, translator);
        this.selectedConfederationId = this.getGameClubConfederation().id;
        this.selectedMatchId = null;
    }

    getGameClubConfederation() {
        return this.controller.getGameClubConfederation();
    }

    getConfederations() {
        return this.controller.getConfederations();
    }

    getCurrentChampionshipEditions() {
        return this.controller.getCurrentChampionshipEditions(this.selectedConfederationId);
    }

    selectConfederation(confederationId) {
        this.selectedConfederationId = parseInt(confederationId);
    }

    selectMatch(matchId) {
        this.selectedMatchId = matchId;
    }
}