class TopScorersViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getTopScorers(championshipEdition) {
        let topScorers = [];

        if (championshipEdition) {
            topScorers = championshipEdition.getTopScorers();
        }
        else {
            topScorers = this.game.championshipEditionPlayers.filter(cep => cep.goals > 0);

            topScorers = Object.values(topScorers.groupBy('player.id')).map(championshipEditionPlayers => ({
                goals: championshipEditionPlayers.map(cep => cep.goals).sum(),
                matches: championshipEditionPlayers.map(cep => cep.matches).sum(),
                player: championshipEditionPlayers[0].player,
            }));

            topScorers = topScorers.orderBy('-goals', 'matches', 'player.name');
        }

        topScorers = topScorers.map((object, index) => ({
            rank: index + 1,
            goals: object.goals,
            matches: object.matches,
            player: object.player,
        }));
        topScorers = topScorers.take(20);
        
        return topScorers;
    }

    loadDefaultPlayerPhoto(event) {
        Common.loadDefaultPlayerPhoto(event);
    }
}