class SquadSectionController {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getPlayers(playerOrder) {
        const players = this.game.club.players.orderBy(playerOrder.orderColumn, 'position.id', '-overall', 'name');
        return players;
    }
}