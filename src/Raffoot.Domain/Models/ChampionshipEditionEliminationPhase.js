class ChampionshipEditionEliminationPhase {
    constructor(championshipEditionId, clubCount) {
        this._championshipEditionId = championshipEditionId;
        this.clubCount = clubCount;
        this._championshipEditionClubIds = [];
        this._matchIds = [];
        this._championshipEditionEliminationPhaseDuelIds = [];
    }

    static create(championshipEdition, clubCount) {
        let championshipEditionEliminationPhase = new ChampionshipEditionEliminationPhase(championshipEdition.id, clubCount);
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

    get clubs() {
        return this.championshipEditionClubs.map(cec => cec.club);
    }

    get matches() {
        return Context.game.matches.filterByIds(this._matchIds);
    }

    get firstDate() {
        return this.matches[0].date;
    }
    
    get lastDate() {
        return this.matches.last().date;
    }

    get championshipEditionEliminationPhaseDuels() {
        return ChampionshipEditionEliminationPhaseDuel.all().filterById(this._championshipEditionEliminationPhaseDuelIds);
    }

    get name() {
        switch (this.clubCount) {
            case 8:
                return 'Quarter-final';
            case 4:
                return 'Semi-final';
            case 2:
                return 'Final';
            default:
                return `Round of ${this.clubCount}`;
        }
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
        const championshipEditionClubs = this.championshipEditionClubs.slice().shuffle();
        
        for (let i = 0; i < championshipEditionClubs.length; i += 2) {
            const clubs = championshipEditionClubs.slice(i, i + 2).map(cec => cec.club);
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