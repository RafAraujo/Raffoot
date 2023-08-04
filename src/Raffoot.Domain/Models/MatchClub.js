class MatchClub {
    constructor(matchId, clubId, situation) {
        this._matchId = matchId;
        this._clubId = clubId;
        this.situation = situation;
        this._goals = null;
        this.matchPlayers = [];
    }

    static create(match, club, situation) {
        let matchClub = new MatchClub(match.id, club.id, situation);
        matchClub.id = Context.game.matchClubs.push(matchClub);
        return matchClub;
    }

    static getById(id) {
        return Context.game.matchClubs[id - 1];
    }

    get match() {
        return Match.getById(this._matchId);
    }

    get club() {
        return Club.getById(this._clubId);
    }

    get goalkeeper() {
        return this.matchPlayers.find(mp => mp.fieldLocalization.position.isGoalkeeper);
    }

    get opponent() {
        return this.match.matchClubs.find(mc => mc !== this);
    }

    get overallDefense() {
        return this.regionOverall('defense');
    }

    get overallMidfield() {
        return this.regionOverall('midfield');
    }

    get overallAttack() {
        return this.regionOverall('attack');
    }

    get goals() {
        return this._goals;
    }

    set goals(value) {
        this._goals = value;
    }

    addGoal() {
        this._goals++;
    }

    addMatchPlayer(squadPlayer) {
        this.matchPlayers.push(new MatchPlayer(this, squadPlayer));
    }

    arrangeTeam() {
        this.matchPlayers = [];
        for (let squadPlayer of this.club.squad.starting11) {
            this.addMatchPlayer(squadPlayer);
        }
    }

    getPlayersAt(fieldRegion) {
        return this.matchPlayers.filter(mp => mp.fieldLocalization.position.fieldRegion === fieldRegion);
    }

    regionOverall(fieldRegion) {
        return this.getPlayersAt(fieldRegion).map(mp => mp.overall).sum();
    }
}