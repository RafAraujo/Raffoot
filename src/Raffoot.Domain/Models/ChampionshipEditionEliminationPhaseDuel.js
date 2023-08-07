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

    get matches() {
        return Context.game.matches.filterById(this._matchIds);
    }

    get clubs() {
        return this.matches[0].clubs;
    }

    get finished() {
        return this.matches.every(m => m.finished);
    }

    get aggregate() {
        if (this.finished) {
            let club1Goals = this.matches.map(m => m.getGoalsByClubId(this.clubs[0].id)).sum();
            let club2Goals = this.matches.map(m => m.getGoalsByClubId(this.clubs[1].id)).sum();

            return `${club1Goals} x ${club2Goals}`;
        }
        else
        {
            return ' x '
        }
    }

    get winner() {

    }
}