class MatchSimulationAction {
    constructor(matchSimulation, time, type) {
        this.matchSimulation = matchSimulation;
        this.time = time;
        this.type = type;
        this.player = matchSimulation.ballPossessor;
        this.target = null;
        this.evaluation = {
            failure: 0,
            success: 0,
            result: 0
        };

        this.matchSimulationEvents = [];
    }

    get club() {
        return this.player.club;
    }

    get isSuccessful() {
        return this.evaluation.result > this.evaluation.failure;
    }

    addEvent(type) {
        const matchSimulationEvent = new MatchSimulationEvent(this.matchSimulation, this.time, type);
        this.matchSimulationEvents.push(matchSimulationEvent);
        matchSimulationEvent.dispatch();
    }

    getResult() {
        this.evaluation.result = Random.number(this.evaluation.success + this.evaluation.failure);
    }
}