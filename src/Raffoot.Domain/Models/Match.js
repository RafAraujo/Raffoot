class Match {
    constructor(championshipEditionId, date) {
        this._championshipEditionId = championshipEditionId;
        this.date = date;
        this._clubIds = [];
    }

    static create(championshipEdition, date) {
        const match = new Match(championshipEdition.id, date);
        match.id = Context.game.matches.push(match);
        championshipEdition.addMatch(match);
        return match;
    }

    static getById(id) {
        return Context.game.matches[id - 1];
    }

    get championshipEdition() {
        return ChampionshipEdition.getById(this._championshipEditionId);
    }

    get clubs() {
        return Context.game.clubs.filterByIds(this._clubIds);
    }

    get clubHome() {
        return Club.getById(this._clubIds[0]);
    }

    get clubAway() {
        return Club.getById(this._clubIds[1]);
    }

    get description() {
        return `${this.clubHome.name} × ${this.clubAway.name}`;
    }

    get goalsHome() {
        return this.goals ? this.goals[0] : null;
    }

    get goalsAway() {
        return this.goals ? this.goals[1] : null;
    }

    get score() {
        return this.goals ? `${this.goals[0]} × ${this.goals[1]}` : null;
    }

    get scoreReverse() {
        return this.goals ? `${this.goals[1]} × ${this.goals[0]}` : null;
    }

    addClub(club, situation) {
        if (this._clubIds.length === 1 && situation === 'home') {
            this._clubIds.unshift(club.id);
        }
        else {
            this._clubIds.push(club.id);
        }
    }

    addGoal(clubId) {
        const index = this._clubIds[0] === clubId ? 0 : 1;
        this.goals[index]++;
    }

    getGoalsByClubId(clubId) {
        if ([this._clubIds].includes(id => id === clubId)) {
            return clubId === this._clubHomeId ? this.goals[0] : this.goals[1];
        }
        throw new Error();
    }

    getOpponent(clubId) {
        if (this._clubIds.includes(clubId)) {
            return clubId === this._clubIds[0] ? this.clubAway : this.clubHome;
        }
        throw new Error();
    }

    prepare() {
        this.goals = [0, 0];
        return new MatchSimulation(this);
    }

    play() {
        this.matchPlaying.play();
    }
}