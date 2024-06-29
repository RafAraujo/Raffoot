class SquadSectionViewModel {
    constructor(game, translator) {
        this.controller = new SquadSectionController(game, translator);
        this.playerOrder = new PlayerOrderViewModel();
    }

    getPlayers() {
        return this.controller.getPlayers(this.playerOrder);
    }
}