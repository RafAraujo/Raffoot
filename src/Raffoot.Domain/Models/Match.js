class Match {
    constructor(championshipEditionId, seasonDateId) {
        this._championshipEditionId = championshipEditionId;
        this._seasonDateId = seasonDateId;
        this._clubIds = [];
        this.isFinished = false;
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

    get seasonDate() {
        return SeasonDate.getById(this._seasonDateId);
    }

    get date() {
        return this.seasonDate.date;
    }

    get description() {
        return this._clubIds.length === 2 ? `${this.clubHome.name} × ${this.clubAway.name}` : '';
    }

    get hasGoals() {
        return (this.goals ?? [0]).sum() > 0;
    }

    get goalsHome() {
        return this.goals ? this.goals[0] : null;
    }

    get goalsAway() {
        return this.goals ? this.goals[1] : null;
    }

    get isDraw() {
        return this.goals ? this.goals[0] === this.goals[1] : false;
    }

    get playersOnField() {
        return this.clubs.flatMap(c => c.playersOnField);
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

    getClubsAnalysis() {
        const clubHomeGoalkeeperOverall = this.clubHome.goalkeeper.overall;
        const clubHomeDefenseOverall = this.clubHome.getRegionOverall(FieldRegion.getByName('defense'));
        const clubHomeMidfieldOverall = this.clubHome.getRegionOverall(FieldRegion.getByName('midfield'));
        const clubHomeAttackOverall = this.clubHome.getRegionOverall(FieldRegion.getByName('attack'));

        const clubAwayGoalkeeperOverall = this.clubHome.goalkeeper.overall;
        const clubAwayDefenseOverall = this.clubHome.getRegionOverall(FieldRegion.getByName('defense'));
        const clubAwayMidfieldOverall = this.clubHome.getRegionOverall(FieldRegion.getByName('midfield'));
        const clubAwayAttackOverall = this.clubHome.getRegionOverall(FieldRegion.getByName('attack'));

        return {
            'goal': `${clubHomeGoalkeeperOverall} x ${clubAwayGoalkeeperOverall}`,
            'defense': `${clubHomeDefenseOverall} x ${clubAwayDefenseOverall}`,
            'midfield': `${clubHomeMidfieldOverall} x ${clubAwayMidfieldOverall}`,
            'attack': `${clubHomeAttackOverall} x ${clubAwayAttackOverall}`,
        }
    }

    getGoals(club) {
        if (this._clubIds.includes(club.id)) {
            return club.id === this._clubIds[0] ? this.goals[0] : this.goals[1];
        }
        throw new Error();
    }

    getGoalsPenaltyShootout(club) {
        if (this._clubIds.includes(club.id)) {
            return club.id === this._clubIds[0] ? this.goalsPenaltyShootout[0] : this.goalsPenaltyShootout[1];
        }
        throw new Error();
    }

    getOpponent(club) {
        if (this._clubIds.includes(club.id)) {
            return club.id === this._clubIds[0] ? this.clubAway : this.clubHome;
        }
        throw new Error();
    }

    getWinner() {
        if (!this.isFinished) {
            return null;
        }

        const club1 = this.clubs[0];
        const club2 = this.clubs[1];

        const club1Goals = this.getGoals(club1);
        const club2Goals = this.getGoals(club2);

        return club1Goals === club2Goals ? null : (club1Goals > club2Goals ? club1 : club2);
    }

    prepare() {
        this.goals = [0, 0];
        this._incrementPlayersMatches();
        this.matchSimulation = MatchSimulation.create(this);
        this.matchSimulation.prepare();
        return this.matchSimulation;
    }

    finish() {
        this.isFinished = true;
        const clubWinner = this.getWinner();

        for (const club of this.clubs) {
            const championshipEditionClub = Context.game.championshipEditionClubs
                .find(cec => cec.championshipEdition.id === this._championshipEditionId && cec.club.id === club.id);
            
            championshipEditionClub.played++;

            if (this.isDraw) {
                championshipEditionClub.drawn++
            }
            else {
                championshipEditionClub.club.id === clubWinner.id ? championshipEditionClub.won++ : championshipEditionClub.lost++;
            }

            if (championshipEditionClub.club.id === this.clubs[0].id) {
                championshipEditionClub.goalsFor += this.goals[0];
                championshipEditionClub.goalsAgainst += this.goals[1];
            }
            else {
                championshipEditionClub.goalsFor += this.goals[1];
                championshipEditionClub.goalsAgainst += this.goals[0];
            }
        }
    }

    _incrementPlayersMatches() {
        const players = this.playersOnField;
        for (const player of players) {
            const championshipEditionPlayer = ChampionshipEditionPlayer.createIfNotExists(this.championshipEdition, player);
            championshipEditionPlayer.matches++;
        }
    }
}