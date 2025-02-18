class ChampionshipEditionClub {
    constructor(championshipEditionId, clubId, bracketOrder) {
        this._championshipEditionId = championshipEditionId;
        this._clubId = clubId;
        this.bracketOrder = bracketOrder;
        this.played = 0;
        this.eliminationPhasesWon = 0;
        this.won = 0;
        this.drawn = 0;
        this.lost = 0;
        this.goalsFor = 0;
        this.goalsAgainst = 0;
        this.last5Results = [];
    }

    static create(championshipEdition, club, bracketOrder) {
        const championshipEditionClub = new ChampionshipEditionClub(championshipEdition.id, club.id, bracketOrder);
        championshipEditionClub.id = Context.game.championshipEditionClubs.push(championshipEditionClub);

        championshipEdition.addChampionshipEditionClub(championshipEditionClub);
        const nationalLeague = ChampionshipType.find('national', 'league');
        if (championshipEdition.championship.championshipType.id === nationalLeague.id)
            championshipEditionClub.club.division = championshipEdition.championship.division;
                
        return championshipEditionClub;
    }

    static getById(id) {
        return Context.game.championshipEditionClubs[id - 1];
    }

    get championshipEdition() {
        return ChampionshipEdition.getById(this._championshipEditionId);
    }

    get club() {
        return Club.getById(this._clubId);
    }

    get matches() {
        return this.won + this.drawn + this.lost;
    }

    get points() {
        return this.won * 3 + this.drawn;
    }

    get goalsDifference() {
        return this.goalsFor - this.goalsAgainst;
    }
}