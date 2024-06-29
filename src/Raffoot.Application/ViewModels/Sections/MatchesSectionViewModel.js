class MatchesSectionViewModel {
    constructor(game, translator) {
        this.controller = new MatchesSectionController(game, translator);
    }

    getCurrentMatchLastEvent() {
        const event = this.controller.getLastEvent();
    }
}