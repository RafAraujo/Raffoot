class MatchSimulationActionFinishing extends MatchSimulationAction {
    constructor(matchSimulationId, time, playerId) {
        super(matchSimulationId, time, 'finishing', playerId)
    }

    static create(matchSimulation, time) {
        const matchSimulationActionFinishing = new MatchSimulationActionFinishing(matchSimulation.id, time, matchSimulation.ballPossessor.id);
        MatchSimulationAction.create(matchSimulationActionFinishing);
        return matchSimulationActionFinishing;
    }

    evaluate() {
        const sim = this.matchSimulation;

        this.evaluation.failure = sim.clubDefending.goalkeeper.overall + sim.clubDefending.getDefenseOverall();
        this.evaluation.success = this.player.overall;
        this.getResult();

        if (this.isSuccessful) {
            MatchSimulationEvent.create(this, this.time, 'goal');
        }

        sim.ballPossessor = sim.clubDefending.goalkeeper;
    }
}