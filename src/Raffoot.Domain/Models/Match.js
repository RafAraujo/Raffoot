class Match {
    constructor(date, championshipEditionId) {
        this.date = date;
        this._championshipEditionId = championshipEditionId;
        this._clubHomeId = null;
        this._clubAwayId = null;
        this.goalsHome = null;
        this.goalsAway = null;
        this.audience = null;
        this.isFinished = false;
    }

    static create(championshipEdition, date) {
        const match = new Match(date, championshipEdition.id);
        match.id = Context.game.matches.push(match);
        championshipEdition.addMatch(match);
        return match;
    }

    static getById(id) {
        return Context.game.matches[id - 1];
    }

    static _formattedScore(club1, club2) {
        return this.finished ? `${club1.goals} × ${club2.goals}` : '';
    }

    get championshipEdition() {
        return ChampionshipEdition.getById(this._championshipEditionId);
    }

    get clubs() {
        return this._clubAwayId ? [this.clubHome, this.clubAway] : null;
    }

    get clubHome() {
        return Club.getById(this._clubHomeId);
    }

    get clubAway() {
        return Club.getById(this._clubAwayId);
    }

    get description() {
        return `${this.clubHome.name} × ${this.clubAway.name}`;
    }

    get income() {
        return this.audience ? this.audience * Config.stadiumTicketPrice : null;
    }

    get score() {
        return this.isFinished ? Match._formattedScore(this.clubHome, this.clubAway) : null;
    }

    get scoreReverse() {
        return Match._formattedScore(this.clubAway, this.clubHome);
    }

    addClub(club, situation) {
        if (situation === 'home') {
            this._clubHomeId = club.id
        }
        else {
            this._clubAwayId = club.id;
        }
    }

    getGoalsByClubId(clubId) {
        return this.matchClubs.find(mc => mc.club.id === clubId).goals;
    }

    getOpponent(clubId) {
        if (this.clubs.map(c => c.id).includes(clubId)) {
            return this.clubs.find(c => c.id != clubId);
        }
        else {
            throw new Error('This match does not include the club');
        }
    }

    prepare() {
        this.audience = Random.number(this.stadium.capacity);
        for (const matchClub of this.matchClubs) {
            matchClub.goals = 0;
            matchClub.arrangeTeam();
        }
        this.finished = false;
        this.matchPlaying = new MatchPlaying(this);
    }

    play() {
        this.matchPlaying.play();
    }
}