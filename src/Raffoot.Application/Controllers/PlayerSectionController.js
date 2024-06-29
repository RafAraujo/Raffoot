class PlayerSectionController  {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getShowingPlayersMessage(players, pageSize) {
        const showing = players.length < pageSize ? players.length : this.pageSize;
        const total = players.length;
        const message = this.translator.get('Showing {0} of {1}').format(showing.toLocaleString(), total.toLocaleString());
        return message;
    }

    searchPlayers(playerFilter) {
        let players = Context.game.players;

        if (playerFilter.name) {
            players = this.game.players.filter(p => p.name.includes(playerFilter.name));
        }

        players = players.filter(p => p.age >= playerFilter.age.minimum && p.age <= playerFilter.age.maximum);
        players = players.filter(p => p.overall >= playerFilter.overall.minimum && p.overall <= playerFilter.overall.maximum);

        if (playerFilter.countryId) {
            players = players.filter(p => p.country.id === playerFilter.countryId);
        }

        if (playerFilter.fieldRegionId) {
            players = players.filter(p => p.position.fieldRegion.id === playerFilter.fieldRegionId);
        }

        if (playerFilter.positionId) {
            players = players.filter(p => p.position.id === playerFilter.positionId);
        }

        players = players.orderBy('_positionId', '-overall', 'name');

        return players;
    }
}