class MatchSimulationActionPassing extends MatchSimulationAction {
    constructor(matchSimulationId, time, playerId) {
        super(matchSimulationId, time, 'passing', playerId)
    }

    static create(matchSimulation, time) {
        const matchSimulationActionPassing = new MatchSimulationActionPassing(matchSimulation.id, time, matchSimulation.ballPossessor.id);
        MatchSimulationAction.create(matchSimulationActionPassing);
        return matchSimulationActionPassing;
    }

    evaluate() {
        const sim = this.matchSimulation;

        this.target = this._chooseTarget();

        this.evaluation.failure = sim.clubDefending.getRegionOverall(sim.marker.fieldLocalization.position.fieldRegion);
        this.evaluation.success = this.player.currentOverall + (sim.ballFieldRegion.name === 'goal' ? sim.clubAttacking.getDefenseOverall() : sim.clubAttacking.getRegionOverall(sim.ballFieldRegion));
        this.getResult();

        sim.ballPossessor = this.isSuccessful ? this.target : sim.marker;
    }

    _chooseTarget() {
        const sim = this.matchSimulation;
        let target = null;

        const fieldRegionAhead = FieldRegion.getById(sim.ballFieldRegion.id + 1);
        
        if (fieldRegionAhead) {
            const playersAhead = sim.clubAttacking.playersOnField.filter(p => p.fieldLocalization.position.fieldRegion.id === fieldRegionAhead.id);
            target = playersAhead.getRandom();
        }
        else {
            const midfield = FieldRegion.getByName('midfield');
            target = sim.clubAttacking.getPlayersAt(midfield).getRandom();
        }

        return target;
    }
}