class MatchSimulationAction {
    constructor(matchSimulationId, time, type, playerId) {
        this._matchSimulationId = matchSimulationId;
        this.time = time;
        this.type = type;
        this._playerId = playerId;
        this.evaluation = {
            failure: 0,
            success: 0,
            result: 0,
        };

        this._matchSimulationEventIds = [];
    }

    static create(matchSimulationAction) {
        const matchSimulation = matchSimulationAction.matchSimulation;
        matchSimulationAction.id = Context.game.matchSimulationActions.push(matchSimulationAction);
        
        matchSimulation.addAction(matchSimulationAction);

        return matchSimulationAction;
    }

    static getById(id) {
        return Context.game.matchSimulationActions[id - 1];
    }

    get club() {
        return this.player.club;
    }

    get isSuccessful() {
        return this.evaluation.result > this.evaluation.failure;
    }

    get matchSimulation() {
        return MatchSimulation.getById(this._matchSimulationId);
    }

    get matchSimulationEvents() {
        return Context.game.matchSimulationEvents.filterByIds(this._matchSimulationEventIds);
    }

    get player() {
        return Player.getById(this._playerId);
    }

    addEvent(matchSimulationEvent) {
        this._matchSimulationEventIds.push(matchSimulationEvent.id);
        matchSimulationEvent.dispatch();
    }

    getResult() {
        this.evaluation.result = Random.number(this.evaluation.success + this.evaluation.failure);
    }
}