class Match {
    constructor(date, championshipEditionId) {
        this.date = date;
        this._championshipEditionId = championshipEditionId;
        this._matchClubIds = [];
        this.audience = null;
        this.finished = false;
    }

    static create(championshipEdition, date) {
        let match = new Match(date, championshipEdition.id);
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
        return this.matchClubs.map(mc => mc.club);
    }

    get matchClubs() {
        return Context.game.matchClubs.filterByIds(this._matchClubIds);
    }

    get matchClubHome() {
        let matchClub = this.matchClubs.find(mc => mc.situation === 'home');
        return matchClub ? matchClub : this.matchClubs[0];
    }

    get matchClubAway() {
        let matchClub = this.matchClubs.find(mc => mc.situation === 'away');
        return matchClub ? matchClub : this.matchClubs[1];
    }

    get description() {
        return `${this.matchClubHome.club.name} x ${this.matchClubAway.club.name}`;
    }

    get income() {
        return this.audience * Config.stadiumTicketPrice;
    }

    get score() {
        return this._formattedScore(this.matchClubHome, this.matchClubAway);
    }

    get scoreReverse() {
        return this._formattedScore(this.matchClubAway, this.matchClubHome);
    }

    _formattedScore(matchClub1, matchClub2) {
        return this.finished ? `${matchClub1.goals} x ${matchClub2.goals}` : '';
    }

    addClub(club, situation) {
        let matchClub = MatchClub.create(this, club, situation);
        this._matchClubIds.push(matchClub.id);
    }

    getGoalsByClub(club) {
        return this.matchClubs.find(mc => mc.club === club).goals;
    }

    prepare() {
        this.audience = Random.number(this.stadium.capacity);
        for (let matchClub of this.matchClubs) {
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