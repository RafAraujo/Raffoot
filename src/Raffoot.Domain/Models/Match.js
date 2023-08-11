class Match {
    constructor(date, championshipEditionId) {
        this.date = date;
        this._championshipEditionId = championshipEditionId;
        this._matchClubIds = [];
        this.audience = null;
        this.finished = false;
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

    get championshipEdition() {
        return ChampionshipEdition.getById(this._championshipEditionId);
    }

    get matchClubs() {
        return Context.game.matchClubs.filterByIds(this._matchClubIds);
    }

    get clubs() {
        return this.matchClubs.map(mc => mc.club);
    }

    get matchClubHome() {
        const matchClub = this.matchClubs.find(mc => mc.situation === 'home');
        return matchClub ? matchClub : this.matchClubs[0];
    }

    get matchClubAway() {
        const matchClub = this.matchClubs.find(mc => mc.situation === 'away');
        return matchClub ? matchClub : this.matchClubs[1];
    }

    get description() {
        return `${this.matchClubHome.club.name} × ${this.matchClubAway.club.name}`;
    }

    get income() {
        return this.audience ? this.audience * Config.stadiumTicketPrice : null;
    }

    get score() {
        return this._formattedScore(this.matchClubHome, this.matchClubAway);
    }

    get scoreReverse() {
        return this._formattedScore(this.matchClubAway, this.matchClubHome);
    }

    _formattedScore(matchClub1, matchClub2) {
        return this.finished ? `${matchClub1.goals} × ${matchClub2.goals}` : '';
    }

    addClub(club, situation) {
        const matchClub = MatchClub.create(this, club, situation);
        this._matchClubIds.push(matchClub.id);
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