class ChampionshipEditionClub {
    constructor(championshipEditionId, clubId) {
        this._championshipEditionId = championshipEditionId;
        this._clubId = clubId;
        this.played = 0;
        this.eliminationPhasesWon = 0;
        this.won = 0;
        this.drawn = 0;
        this.lost = 0;
        this.goalsFor = 0;
        this.goalsAgainst = 0;
    }

    static create(championshipEdition, club) {
        const championshipEditionClub = new ChampionshipEditionClub(championshipEdition.id, club.id);
        championshipEditionClub.id = Context.game.championshipEditionClubs.push(championshipEditionClub);
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

    get points() {
        return this.won * 3 + this.drawn;
    }

    get goalsDifference() {
        return this.goalsFor - this.goalsAgainst;
    }
}