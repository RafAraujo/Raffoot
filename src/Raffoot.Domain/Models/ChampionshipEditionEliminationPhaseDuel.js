class ChampionshipEditionEliminationPhaseDuel {
    constructor(championshipEditionEliminationPhaseId, matchIds) {
        this._championshipEditionEliminationPhaseId = championshipEditionEliminationPhaseId;
        this._matchIds = matchIds;
    }

    static create(championshipEditionEliminationPhase, matches) {
        const championshipEditionEliminationPhaseDuel = new ChampionshipEditionEliminationPhaseDuel(championshipEditionEliminationPhase.id, matches.map(m => m.id));
        championshipEditionEliminationPhaseDuel.id = Context.game.championshipEditionEliminationPhaseDuels.push(championshipEditionEliminationPhaseDuel);
        championshipEditionEliminationPhase.addChampionshipEditionEliminationPhaseDuel(championshipEditionEliminationPhaseDuel);
        return championshipEditionEliminationPhaseDuel;
    }

    static getById(id) {
        return Context.game.championshipEditionEliminationPhaseDuels[id - 1];
    }

    get championshipEditionEliminationPhase() {
        return ChampionshipEditionEliminationPhase.getById(this._championshipEditionEliminationPhaseId);
    }

    get clubs() {
        return this.matches[0].clubs;
    }

    get isFinished() {
        return this.matches.every(m => m.isFinished);
    }
    
    get matches() {
        return Context.game.matches.filterByIds(this._matchIds);
    }

    getGoals(club) {
        return this.matches.map(m => m.getGoals(club)).sum()
    }

    getGoalsPenaltyShootout(club) {
        return this.matches.map(m => m.getGoalsPenaltyShootout(club)).sum()
    }

    getWinner() {
        if (!this.isFinished) {
            return null;
        }

        const club1 = this.clubs[0];
        const club2 = this.clubs[1];

        let club1Goals = this.getGoals(club1);
        let club2Goals = this.getGoals(club2);

        if (club1Goals === club2Goals) {
            club1Goals = 2; //this.getGoalsPenaltyShootout(club1);
            club2Goals = 1; // this.getGoalsPenaltyShootout(club2);
        }

        return club1Goals > club2Goals ? club1 : club2;
    }
}