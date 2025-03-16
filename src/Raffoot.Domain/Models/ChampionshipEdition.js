class ChampionshipEdition {
    constructor(championshipId, seasonId) {
        this._championshipId = championshipId;
        this._seasonId = seasonId;
        this._seasonDateIds = [];

        this._championshipEditionClubIds = [];
        this._championshipEditionPlayerIds = [];
        this._championshipEditionEliminationPhaseIds = [];
        this._championshipEditionFixtureIds = [];
        this._championshipEditionGroupIds = [];

        this._matchIds = [];
    }

    static create(championship, season) {
        const championshipEdition = new ChampionshipEdition(championship.id, season.id);
        championshipEdition.id = Context.game.championshipEditions.push(championshipEdition);
        return championshipEdition;
    }

    static getById(id) {
        return Context.game.championshipEditions[id - 1];
    }

    get championship() {
        return Championship.getById(this._championshipId);
    }

    get championshipEditionClubs() {
        return Context.game.championshipEditionClubs.filterByIds(this._championshipEditionClubIds);
    }

    get championshipEditionPlayers() {
        return Context.game.championshipEditionPlayers.filterByIds(this._championshipEditionPlayerIds);
    }

    get championshipEditionGroups() {
        return Context.game.championshipEditionGroups.filterByIds(this._championshipEditionGroupIds);
    }

    get championshipEditionEliminationPhases() {
        return Context.game.championshipEditionEliminationPhases.filterByIds(this._championshipEditionEliminationPhaseIds);
    }

    get championshipEditionFixtures() {
        return Context.game.championshipEditionFixtures.filterByIds(this._championshipEditionFixtureIds);
    }

    get championshipEditionPlayers() {
        return Context.game.championshipEditionPlayers.filterByIds(this._championshipEditionPlayerIds);
    }

    get clubs() {
        return this.championshipEditionClubs.map(cec => cec.club);
    }

    get isFinished() {
        return this.matches.every(m => m.isFinished);
    }

    get matches() {
        return Context.game.matches.filterByIds(this._matchIds);
    }

    get name() {
        return `${this.championship.name} ${this.season.year}`;
    }

    get season() {
        return Season.getById(this._seasonId);
    }

    get seasonDates() {
        return Context.game.seasonDates.filterByIds(this._seasonDateIds);
    }

    addChampionshipEditionClub(championshipEditionClub) {
        this._championshipEditionClubIds.push(championshipEditionClub.id);
    }

    addChampionshipEditionPlayer(championshipEditionPlayer) {
        this._championshipEditionPlayerIds.push(championshipEditionPlayer.id);
    }

    addMatch(match) {
        this._matchIds.push(match.id);
    }

    addSeasonDates(seasonDates) {
        this._seasonDateIds = seasonDates.map(sd => sd.id);
    }

    getChampion() {
        if (!this.isFinished)
            return null;

        if (this.championship.regulation === 'round-robin') {
            return this.getLeagueTable()[0];
        }
    }

    getContinentalCupClassificationZonePositions(continentalCupDivision) {
        const positions = [];

        if (this.championship.division === 1) {
            if (this.championship.isNationalLeague) {
                const start = continentalCupDivision === 1 ? 1 : this.championship.confederation.getContinentalCupSlots(1) + 1;
                const cupSlots = this.championship.confederation.getContinentalCupSlots(continentalCupDivision);
                for (let position = start; position < start + cupSlots; position++)
                    positions.push(position);
            }
            else if (this.championship.isNationalCup && continentalCupDivision === 2) {
                positions.push(1);
            }
        }

        return positions;
    }

    getContinentalCupClassificationZoneClubs(continentalCupDivision) {
        const positions = this.getContinentalCupClassificationZonePositions(continentalCupDivision);
        return this.table.firstItems(positions.length);
    }

    getPromotionZonePositions() {
        const positions = [];

        if (this.championship.championshipType.format === 'league' && this.championship.division > 1) {
            const clubCount = this.championship.promotionClubCount;
            for (let position = 1; position <= clubCount; position++) {
                positions.push(position);
            }
        }

        return positions;
    }

    getPromotionZoneClubs() {
        const positions = this.getPromotionZonePositions();
        return this.table.take(positions.length);
    }

    getRelegationZonePositions() {
        const positions = [];

        if (this.championship.championshipType.format === 'league') {
            const clubCount = this.championship.relegationClubCount;
            for (let position = this.clubs.length; position > this.clubs.length - clubCount; position--) {
                positions.push(position);
            }
        }

        return positions;
    }

    getRelegationZoneClubs() {
        const positions = this.getRelegationZonePositions();
        return this.table.lastItems(positions.length);
    }

    getLeagueTable() {
        if (this.championship.championshipType.format === 'league')
            return this.championshipEditionClubs.orderBy('-points', '-won', '-goalsDifference', '-goalsFor', 'club.name');
        else
            return null;
    }

    getTopScorers() {
        return this.championshipEditionPlayers
            .filter(cep => cep.goals > 0)
            .orderBy('-goals', 'matches', 'player.name');
    }

    getTopAssists() {
        return this.championshipEditionPlayers.orderBy('-assists', 'matches');
    }

    getTopPlayers() {
        return this.championshipEditionPlayers.orderBy('-averageRating', 'matches');
    }

    scheduleMatches() {
        switch (this.championship.regulation) {
            case 'elimination':
                this._defineChampionshipEditionEliminationPhases();
                this._scheduleMatchesElimination();
                break;
            case 'groups':
                this._defineChampionshipEditionGroups();
                this._defineChampionshipEditionEliminationPhases();
                this._scheduleMatchesChampionshipEditionGroups();
                break;
            case 'league then elimination':
                this._defineChampionshipEditionFixtures();
                break;
            case 'round-robin':
                this._defineChampionshipEditionFixtures();
                this._scheduleMatchesRoundRobin();
                break;
        }
    }

    _defineChampionshipEditionEliminationPhases() {
        let clubCount = this.championship.regulation === 'groups' ?
            this.championship.groupCount * this.championship.qualifiedClubsByGroupCount :
            this.championship.clubCount;
        
        let start = 0;

        while (clubCount >= 2) {
            const seasonDates = this.seasonDates.slice(this.championship.groupDateCount).slice(start, start += 2);
            const championshipEditionEliminationPhase = ChampionshipEditionEliminationPhase.create(this, clubCount, seasonDates);
            this._championshipEditionEliminationPhaseIds.push(championshipEditionEliminationPhase.id);
            clubCount /= 2;
        }
    }

    _defineChampionshipEditionGroups() {
        const championshipEditionClubs = this.championshipEditionClubs.slice();

        for (const i = 0; i < this.championship.groupCount; i++) {
            const championshipEditionFixtures = this.championship.groupDateCount.map((_, index) => ChampionshipEditionFixture.create(this, index + 1));
            const championshipEditionGroup = ChampionshipEditionGroup.create(this, i + 1, championshipEditionFixtures);

            for (const j = 0; j < this.championship.group.clubCount; j++) {
                const championshipEditionClub = championshipEditionClubs.getRandom();
                championshipEditionGroup.addChampionshipEditionClub(championshipEditionClub);
                championshipEditionClubs.remove(championshipEditionClub);
            }

            this._championshipEditionGroupIds.push(championshipEditionGroup.id);
        }
    }

    _defineChampionshipEditionFixtures() {
        const dateCount = this.championship.getDateCount();
        for (let i = 0; i < dateCount; i++) {
            const fixture = ChampionshipEditionFixture.create(this, i + 1);
            this._championshipEditionFixtureIds.push(fixture.id);
        }
    }

    _scheduleMatchesChampionshipEditionGroups() {
        for (const championshipEditionGroup of this.championshipEditionGroups)
            ChampionshipEdition._genericRoundRobin(this, this.groupDates, championshipEditionGroup.clubs, championshipEditionGroup.championshipEditionFixtures);
    }

    _scheduleMatchesElimination() {
        for (const championshipEditionEliminationPhase of this.championshipEditionEliminationPhases) {
            for (let i = 0; i < championshipEditionEliminationPhase.clubCount; i += 2) {
                for (const seasonDate of championshipEditionEliminationPhase.seasonDates) {
                    const match = Match.create(this, seasonDate);
                    championshipEditionEliminationPhase.addMatch(match);
                }
            }
        }

        if (this.championship.regulation === 'elimination') {
            this.championshipEditionEliminationPhases[0].qualify(this.championshipEditionClubs);
        }
    }

    _scheduleMatchesRoundRobin() {
        ChampionshipEdition._genericRoundRobin(this, this.seasonDates, this.clubs, this.championshipEditionFixtures);
    }

    static _genericRoundRobin(championshipEdition, seasonDates, clubs, championshipEditionFixtures) {
        const matches = [];

        clubs = clubs.slice().shuffle();

        for (let i = 0; i < championshipEditionFixtures.length; i++) {
            const championshipEditionFixture = championshipEditionFixtures[i];
            const seasonDate = seasonDates[i];
            
            championshipEditionFixture.seasonDate = seasonDate;

            for (let j = 0; j < clubs.length / 2; j++) {
                let match = Match.create(championshipEdition, seasonDate);

                match.addClub(clubs[j], i % 2 === 0 ? 'home' : 'away');
                match.addClub(clubs[clubs.length - 1 - j], i % 2 === 0 ? 'away' : 'home');

                championshipEditionFixture.addMatch(match);
                matches.push(match);
            }
            rotate(clubs);

            function rotate(clubs) {
                clubs.splice(1, 0, clubs.pop());
            }
        }

        return matches;
    }

    continentalCupClassificationZonePositions(continentalCupDivision) {
        const positions = [];
        const slots = this.championship.country.continentalCupSlots;

        if (this.championship.championshipType.format === 'league' && this.championship.division === 1)
            for (const position = (slots * (continentalCupDivision - 1)) + 1; position <= slots * continentalCupDivision; position++)
                positions.push(position);

        return positions;
    }

    continentalCupClassificationZoneClubs(division) {
        return this.table.take(this.continentalCupClassificationZonePositions(division).length);
    }
}