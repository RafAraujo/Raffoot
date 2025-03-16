class ChampionshipEditionEliminationPhase {
    constructor(championshipEditionId, clubCount, seasonDateIds) {
        this._championshipEditionId = championshipEditionId;
        this.clubCount = clubCount;
        this._championshipEditionClubIds = [];
        this._seasonDateIds = seasonDateIds;
        this._matchIds = [];
        this._championshipEditionEliminationPhaseDuelIds = [];
    }

    static create(championshipEdition, clubCount, seasonDates) {
        const seasonDateIds = seasonDates.map(sd => sd.id);
        const championshipEditionEliminationPhase = new ChampionshipEditionEliminationPhase(championshipEdition.id, clubCount, seasonDateIds);
        championshipEditionEliminationPhase.id = Context.game.championshipEditionEliminationPhases.push(championshipEditionEliminationPhase);
        return championshipEditionEliminationPhase;
    }

    static getById(id) {
        return Context.game.championshipEditionEliminationPhases[id - 1];
    }

    get championshipEdition() {
        return ChampionshipEdition.getById(this._championshipEditionId);
    }

    get championshipEditionClubs() {
        return Context.game.championshipEditionClubs.filterByIds(this._championshipEditionClubIds);
    }

    get championshipEditionEliminationPhaseDuels() {
        return Context.game.championshipEditionEliminationPhaseDuels.filterByIds(this._championshipEditionEliminationPhaseDuelIds);
    }

    get clubs() {
        return this.championshipEditionClubs.map(cec => cec.club);
    }

    get firstDate() {
        return this.matches[0].date;
    }
    
    get lastDate() {
        return this.matches.last().date;
    }

    get matches() {
        return Context.game.matches.filterByIds(this._matchIds);
    }

    get name() {
        switch (this.clubCount) {
            case 8:
                return 'Quarter-finals';
            case 4:
                return 'Semifinals';
            case 2:
                return 'Final';
            default:
                return `Round of ${this.clubCount}`;
        }
    }

    get seasonDates() {
        return Context.game.seasonDates.filterByIds(this._seasonDateIds);
    }

    addChampionshipEditionEliminationPhaseDuel(championshipEditionEliminationPhaseDuel) {
        this._championshipEditionEliminationPhaseDuelIds.push(championshipEditionEliminationPhaseDuel.id);
    }

    qualify(championshipEditionClubs) {
        this._championshipEditionClubIds = championshipEditionClubs.map(cec => cec.id);
        this._defineDuels();
    }

    addMatch(match) {
        this._matchIds.push(match.id);
    }

    _defineDuels() {
        const championshipEditionClubs = this.championshipEditionClubs.orderBy('-bracketOrder');
        
        for (let i = 0; i < championshipEditionClubs.length; i += 2) {
            const clubs = [championshipEditionClubs[i], championshipEditionClubs[championshipEditionClubs.length - 1 - i]].map(cec => cec.club);
            const matches = this.matches.slice(i, i + 2);
            const matchesPerPhase = this.championshipEdition.championship.isTwoLeggedTie ? 2 : 1;

            for (let j = 0; j < matchesPerPhase; j++) {
                let match = matches[j];

                match.addClub(clubs[0], j ? 'home' : 'away');
                match.addClub(clubs[1], j ? 'away' : 'home');
            }

            ChampionshipEditionEliminationPhaseDuel.create(this, matches);
        }
    }
}