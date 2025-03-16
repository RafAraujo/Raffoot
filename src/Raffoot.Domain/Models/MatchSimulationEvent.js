class MatchSimulationEvent {
    constructor(matchSimulationActionId, time, type) {
        this._matchSimulationActionId = matchSimulationActionId;
        this.time = time;
        this.type = type;
        this.player = null;
    }

    static create(matchSimulationAction, time, type) {
        const matchSimulationEvent = new MatchSimulationEvent(matchSimulationAction.id, time, type);
        matchSimulationEvent.id = Context.game.matchSimulationEvents.push(matchSimulationEvent);

        matchSimulationAction.addEvent(matchSimulationEvent);

        return matchSimulationEvent;
    }

    static getById(id) {
        return Context.game.matchSimulationEvents[id - 1];
    }

    get club() {
        return this.player.club;
    }

    get matchSimulation() {
        return this.matchSimulationAction.matchSimulation;
    }

    get matchSimulationAction() {
        return MatchSimulationAction.getById(this._matchSimulationActionId);
    }

    dispatch() {
        switch (this.type) {
            case 'goal':
                this._goal();
                break;
            case 'foul':
                this._foul();
                break;
        }
    }

    _addAssist(player) {
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(player);
        championshipEditionPlayer.assists++;
    }

    _addGoal(player) {
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(player);
        championshipEditionPlayer.goals++;
    }

    _addRedCard(player) {
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(player);
        championshipEditionPlayer.redCard = true;
        player.club.movePlayerToUnlisted(player);
    }

    _addYellowCard(player) {
        const playerHasYellowCard = this.matchSimulation.getYellowCards(player) > 0;
        const championshipEditionPlayer = this._getChampionshipEditionPlayer(player);
        championshipEditionPlayer.yellowCards++;
        if (playerHasYellowCard) {
            this._addRedCard(player);
        }
    }

    _foul() {
        this.player = this.matchSimulation.marker;
    }

    _getChampionshipEditionPlayer(player) {
        return this.matchSimulation.match.championshipEdition.championshipEditionPlayers.find(cep => cep.player.id === player.id);
    }

    _goal() {
        this.player = this.matchSimulation.ballPossessor;
        this.matchSimulation.match.addGoal(this.player.club.id);
        this._addGoal(this.player);
        const previousAction = this.matchSimulation.previousAction;
        if (previousAction?.player.club.id === this.player.club.id && previousAction.type === 'passing') {
            this._addAssist(this.matchSimulation.previousAction.player);
        }
    }
}