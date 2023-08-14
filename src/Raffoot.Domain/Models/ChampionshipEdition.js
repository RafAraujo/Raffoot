class ChampionshipEdition {
    constructor(championshipId, year) {
        this._championshipId = championshipId;
        this.year = year;
        this._championshipEditionClubIds = [];
        this._championshipEditionEliminationPhaseIds = [];
        this._championshipEditionFixtureIds = [];
        this._championshipEditionPlayerIds = [];
        this.dates = [];
        this._matchIds = [];
    }

    static create(championship, year) {
        const championshipEdition = new ChampionshipEdition(championship.id, year);
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

    get eliminationPhaseDates() {
        if (this.championship.championshipType.regulation === 'round-robin')
            return [];
        else
            return this.dates.slice(this.championship.groupDatesCount);
    }

    get groupDates() {
        if (this.championship.championshipType.regulation != 'groups')
            return [];
        else
            return this.dates.slice(0, this.championship.groupDatesCount - 1);
    }

    get matches() {
        return Context.game.matches.filterByIds(this._matchIds);
    }

    get name() {
        return `${this.championship.name} ${this.year}`;
    }

    get table() {
        return this.championshipEditionClubs.orderBy('-championshipEditionEliminationPhasesWon', '-points', '-won', '-goalsDifference', '-goalsFor', 'club.name');
    }

    get topAssists() {
        return this.championshipEditionPlayers.orderBy('-assists', 'appearances', 'timePlayed');
    }

    get topPlayers() {
        return this.championshipEditionPlayers.orderBy('-averageRating', 'appearances', 'timePlayed');
    }

    get topScorers() {
        return this.championshipEditionPlayers.orderBy('-goals', 'appearances', 'timePlayed');
    }

    addClub(club) {
        const championshipEditionClub = ChampionshipEditionClub.create(this, club);
        this._championshipEditionClubIds.push(championshipEditionClub.id);
    }

    addMatch(match) {
        this._matchIds.push(match.id);
    }

    getContinentalCupClassificationZonePositions(continentalCupDivision) {
        const positions = [];

        const nationalCup = ChampionshipType.find('national', 'cup');
        const nationalLeague = ChampionshipType.find('national', 'league');

        if (this.championship.division === 1) {
            if (this.championship.championshipType.id === nationalLeague.id) {
                const start = continentalCupDivision === 1 ? 1 : this.championship.confederation.getContinentalCupSpots(1) + 1;
                const cupSpots = this.championship.confederation.getContinentalCupSpots(continentalCupDivision);
                for (let position = start; position < start + cupSpots; position++) {
                    positions.push(position);
                }
            }
            else if (this.championship.championshipType.id === nationalCup.id && continentalCupDivision === 2) {
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

    scheduleMatches(dates) {
        this.dates = dates;

        switch (this.championship.championshipType.regulation) {
            case 'elimination':
                this._defineChampionshipEditionEliminationPhases();
                this._scheduleMatchesElimination();
                break;
            case 'groups':
                this._defineChampionshipEditionGroups();
                this._defineChampionshipEditionEliminationPhases();
                this._scheduleMatchesChampionshipEditionGroups();
                break;
            case 'round-robin':
                this._defineChampionshipEditionFixtures();
                this._scheduleMatchesRoundRobin();
                break;
        }
    }

    _defineChampionshipEditionEliminationPhases() {
        let clubCount = this.championship.championshipType.regulation === 'groups' ?
            this.championship.groupCount * this.championship.qualifiedClubsByGroupCount :
            this.championship.clubCount;

        while (clubCount >= 2) {
            const eliminationPhase = ChampionshipEditionEliminationPhase.create(this, clubCount);
            this._championshipEditionEliminationPhaseIds.push(eliminationPhase.id);
            clubCount /= 2;
        }
    }

    _defineChampionshipEditionGroups() {
        let championshipEditionClubs = this.championshipEditionClubs.slice();

        for (const i = 0; i < this.championship.groupCount; i++) {
            let group = ChampionshipEditionGroup.create(this, i + 1);

            for (const j = 0; j < this.championship.groupClubCount; j++) {
                let championshipEditionClub = championshipEditionClubs.getRandom();
                group.addChampionshipEditionClub(championshipEditionClub);
                championshipEditionClubs.remove(championshipEditionClub);
            }

            this._championshipEditionGroupIdss.push(group.id);
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
        for (const group of this.championshipEditionGroups) {
            let matches = ChampionshipEdition.genericRoundRobin(this, this.groupDates, group.clubs, this.championship.isTwoLeggedTie);
            group.addMatches(matches);
        }

        this._scheduleMatchesElimination();
    }

    _scheduleMatchesElimination() {
        let eliminationPhases = this.championshipEditionEliminationPhases;
        let matchesPerPhase = this.championship.isTwoLeggedTie ? 2 : 1;

        for (let i = 0; i < eliminationPhases.length; i++) {
            let eliminationPhase = eliminationPhases[i];

            for (let j = 0; j < eliminationPhase.clubCount; j += 2) {
                for (let k = 0; k < matchesPerPhase; k++) {
                    const date = this.eliminationPhaseDates[i * matchesPerPhase + k];

                    const match = Match.create(this, date);
                    eliminationPhase.addMatch(match);
                }
            }
        }

        if (this.championship.championshipType.regulation === 'elimination') {
            eliminationPhases[0].qualify(this.championshipEditionClubs);
        }
    }

    _scheduleMatchesRoundRobin() {
        ChampionshipEdition.genericRoundRobin(this, this.dates, this.clubs, this.championship.isTwoLeggedTie);
    }

    static genericRoundRobin(championshipEdition, dates, clubs, isTwoLeggedTie) {
        const matches = [];
        const rounds = (clubs.length - 1) * (isTwoLeggedTie ? 2 : 1);

        for (let i = 0; i < rounds; i++) {
            const date = dates[i];
            for (let j = 0; j < clubs.length / 2; j++) {
                let match = Match.create(championshipEdition, date);

                match.addClub(clubs[j], i % 2 === 0 ? 'home' : 'away');
                match.addClub(clubs[clubs.length - 1 - j], i % 2 === 0 ? 'away' : 'home');

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
        const spots = this.championship.country.continentalCupSpots;

        if (this.championship.championshipType.format === 'league' && this.championship.division === 1) {
            for (const position = (spots * (continentalCupDivision - 1)) + 1; position <= spots * continentalCupDivision; position++) {
                positions.push(position);
            }
        }

        return positions;
    }

    continentalCupClassificationZoneClubs(division) {
        return this.table.take(this.continentalCupClassificationZonePositions(division).length);
    }
}