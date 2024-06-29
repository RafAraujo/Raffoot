class MatchSimulationEvent {
    constructor(matchSimulation, time, type) {
        this.matchSimulation = matchSimulation;
        this.time = time;
        this.type = type;
        this.player = null;
    }

    dispatch() {
        switch (this.type) {
            case 'goal':
                this._addGoal();
            case 'foul':
                this._addFoul();
        }
    }

    _addGoal() {
        this.player = this.matchSimulation.ballPossessor;
        this.matchSimulation.match.addGoal(this.player.club.id);
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(this.player);
        championshipEditionPlayer.goals++;
        const previousAction = this.matchSimulation.previousAction;
        if (previousAction?.player.club.id === this.player.club.id && previousAction.type === 'passing') {
            this._addAssist(this.matchSimulation.previousAction.player);
        }
    }

    _addAssist(player) {
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(player);
        championshipEditionPlayer.assists++;
    }

    _addFoul() {
        this.player = this.matchSimulation.marker;
    }

    _addYellowCard(player) {
        const playerHasYellowCard = this.matchSimulation.getYellowCards(player) > 0;
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(player);
        championshipEditionPlayer.yellowCards++;
        if (playerHasYellowCard) {
            this._addRedCard(player);
        }
    }

    _addRedCard(player) {
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(player);
        championshipEditionPlayer.redCard = true;
        player.fieldLocalization = null;
    }

    _getChampionshipEditionPlayer(player) {
        return this.matchSimulation.match.championshipEdition.championshipEditionPlayers.find(cep => cep.player.id === player.id);
    }
}