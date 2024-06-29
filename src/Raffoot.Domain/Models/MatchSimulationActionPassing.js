class MatchSimulationActionPassing extends MatchSimulationAction {
    constructor(matchSimulation, time) {
        super(matchSimulation, time, 'passing')
    }

    evaluate() {
        const sim = this.matchSimulation;

        this.target = this._chooseTarget();

        this.evaluation.failure = sim.clubDefending.getRegionOverall(sim.marker.fieldLocalization.position.fieldRegion);
        this.evaluation.success = sim.ballPossessor.overall + (sim.ballLocation.name === 'goal' ? sim.clubAttacking.getDefenseOverall() : sim.clubAttacking.getRegionOverall(sim.ballLocation));
        this.getResult();

        if (this.isSuccessful) {
            sim.ballPossessor = this.target;
        }
        else {
            sim.ballPossessor = sim.clubDefending.getPlayersAt(sim.ballLocation.inverse).getRandom();
        }
    }

    _chooseTarget() {
        const sim = this.matchSimulation;
        let target = null

        const playersAhead = sim.clubAttacking.playersOnField.filter(p => p.fieldLocalization.line > sim.ballPossessor.fieldLocalization.line).orderBy('fieldLocalization.id');
        if (playersAhead.length === 0) {
            const midfield = FieldRegion.getByName('midfield');
            target = sim.clubAttacking.getPlayersAt(midfield).getRandom();
        }
        else {
            const table = this._generateClassIntervals(playersAhead);
            const max = table.map(t => t.classInterval.upperLimit).max();
            const result = Random.number(max);
            target = table.find(t => result >= t.classInterval.lowerLimit && result <= t.classInterval.upperLimit).player;
        }

        return target;
    }

    _generateClassIntervals(players) {
        const table = []
        let min = 0;
        for (const player of players) {
            let max = (5 - player.fieldLocalization.position.fieldRegion.id) * 12 - player.fieldLocalization.line;
            table.push(
                {
                    player: player,
                    classInterval:
                    {
                        lowerLimit: min,
                        upperLimit: min + max
                    }
                })
            min += ++max;
        }
        return table;
    }
}