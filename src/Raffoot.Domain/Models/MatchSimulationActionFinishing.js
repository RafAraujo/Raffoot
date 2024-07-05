class MatchSimulationActionFinishing extends MatchSimulationAction {
    constructor(matchSimulation, time) {
        super(matchSimulation, time, 'finishing')
    }

    evaluate() {
        const sim = this.matchSimulation;

        this.evaluation.failure = sim.clubDefending.goalkeeper.overall + sim.clubDefending.getDefenseOverall();
        this.evaluation.success = sim.ballPossessor.overall;
        this.getResult();

        if (this.isSuccessful) {
           this.addEvent('goal');
        }

        sim.ballPossessor = sim.clubDefending.goalkeeper;
    }
}