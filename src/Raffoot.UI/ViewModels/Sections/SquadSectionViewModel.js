class SquadSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.playerOrder = new PlayerOrderViewModel('position.id');
    }

    getColorClass(colorName) {
        return Config.colors[colorName].class;
    }

    getPlayers() {
        const players = this.game.club.players.orderBy(this.playerOrder.orderColumn, 'position.id', '-overall', 'name');
        return players;
    }
}