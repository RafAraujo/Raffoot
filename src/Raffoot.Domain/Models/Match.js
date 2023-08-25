class Match {
    constructor(championshipEditionId, seasonDateId) {
        this._championshipEditionId = championshipEditionId;
        this._seasonDateId = seasonDateId;
        this._clubIds = [];
    }

    static create(championshipEdition, seasonDate) {
        const match = new Match(championshipEdition.id, seasonDate.id);
        match.id = Context.game.matches.push(match);

        championshipEdition.addMatch(match);
        seasonDate.addMatch(match);

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

    get date() {
        return SeasonDate.getById(this._seasonDateId).date;
    }

    get description() {
        return this._clubIds.length === 2 ? `${this.clubHome.name} × ${this.clubAway.name}` : '';
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

    getGoals(clubId) {
        if ([this._clubIds].includes(id => id === clubId)) {
            return clubId === this._clubHomeId ? this.goals[0] : this.goals[1];
        }
        throw new Error();
    }

    getGoalsPenaltyShootout(clubId) {
        if ([this._clubIds].includes(id => id === clubId)) {
            return clubId === this._clubHomeId ? this.goalsPenaltyShottout[0] : this.goalsPenaltyShottout[1];
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
        this._incrementPlayersMatches();
        return new MatchSimulation(this);
    }

    play() {
        this.matchPlaying.play();
    }

    _incrementPlayersMatches() {
        const playersOnField = this.clubs.flatMap(c => c.playersOnField);
        for (const player of playersOnField) {
            const championshipEditionPlayer = ChampionshipEditionPlayer.createIfNotExists(this.championshipEdition, player);
            championshipEditionPlayer.matches++;
        }
    }
}