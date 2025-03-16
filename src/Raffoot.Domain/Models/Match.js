class Match {
    constructor(championshipEditionId, seasonDateId) {
        this._championshipEditionId = championshipEditionId;
        this._seasonDateId = seasonDateId;
        this._clubIds = [];
        this._playerSubstitutionIds = [];
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

    get fullDescription() {
        return this._clubIds.length === 2 ? `${this.clubHome.name} ${this.goals[0]}×${this.goals[1]} ${this.clubAway.name}` : '';
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

    get playerSubstitutions() {
        return Context.game.playerSubstitutions.filterByIds(this._playerSubstitutionIds);
    }

    get score() {
        return this.goals ? `${this.goals[0]} × ${this.goals[1]}` : null;
    }

    get scoreReverse() {
        return this.goals ? `${this.goals[1]} × ${this.goals[0]}` : null;
    }

    addClub(club, situation) {
        if (this._clubIds.length === 1 && situation === 'home')
            this._clubIds.unshift(club.id);
        else
            this._clubIds.push(club.id);
    }

    addGoal(clubId) {
        const index = this._clubIds[0] === clubId ? 0 : 1;
        this.goals[index]++;
    }

    addPlayerSubstitution(playerSubstitution) {
        this._playerSubstitutionIds.push(playerSubstitution.id);
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
        if (this._clubIds.includes(club.id))
            return club.id === this._clubIds[0] ? this.clubAway : this.clubHome;
        throw new Error();
    }

    getPlayerSubstitutionsLeft(club) {
        const substitutions = this.playerSubstitutions.filter(ps => ps.club.id === club.id);
        const substitutionsLeft = Config.match.maxPlayerSubstitutions - substitutions.length;
        return substitutionsLeft;
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

    makePlayerSubstitution(time, club, playerOut, playerIn) {
        if (!this.matchSimulation)
            throw new Error();

        PlayerSubstitution.create(this, time, club, playerOut, playerIn);

        club.swapPlayerRoles(playerOut, playerIn);
        club.movePlayerToUnlisted(playerOut);
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

            const matchInfo = this._getMatchInfo(club, clubWinner);

            if (matchInfo.result === 'Draw')
                championshipEditionClub.drawn++
            else
                matchInfo.result === 'Win' ? championshipEditionClub.won++ : championshipEditionClub.lost++;

            if (championshipEditionClub.club.id === this.clubs[0].id) {
                championshipEditionClub.goalsFor += this.goals[0];
                championshipEditionClub.goalsAgainst += this.goals[1];
            }
            else {
                championshipEditionClub.goalsFor += this.goals[1];
                championshipEditionClub.goalsAgainst += this.goals[0];
            }

            if (this.championshipEdition.championship.isNationalLeague) {
                championshipEditionClub.last5Results.push(matchInfo);
                if (championshipEditionClub.last5Results.length > 5)
                    championshipEditionClub.last5Results.shift();
            }
        }
    }

    _getMatchInfo(club, clubWinner) {
        const matchInfo = {
            description: this.fullDescription
        };

        if (this.isDraw) {
            matchInfo.result = 'Draw';
        }
        else {
            if (club.id === clubWinner.id)  {
                matchInfo.result = 'Win';
            }
            else {
                matchInfo.result = 'Loss';
            }
        }

        return matchInfo;
    }

    _incrementPlayersMatches() {
        const players = this.playersOnField;
        for (const player of players) {
            const championshipEditionPlayer = ChampionshipEditionPlayer.createIfNotExists(this.championshipEdition, player);
            championshipEditionPlayer.matches++;
        }
    }
}