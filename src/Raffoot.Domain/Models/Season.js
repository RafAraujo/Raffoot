class Season {
    constructor(year, isFirst, championshipTypeIds) {
        this.year = year;
        this.isFirst = isFirst;
        this._championshipTypeIds = championshipTypeIds;
        this._championshipEditionsIds = [];
        this._seasonDateIds = [];
        this._currentSeasonDateIndex = 0;
    }

    static create(year, isFirst, championshipTypes) {
        const championshipTypeIds = championshipTypes.map(ct => ct.id);
        const season = new Season(year, isFirst, championshipTypeIds);
        season.id = Context.game.seasons.push(season);
        return season;
    }

    static getById(id) {
        return Context.game.seasons[id - 1];
    }

    get championshipTypes() {
        return Context.game.championshipTypes.filterByIds(this._championshipTypeIds);
    }

    get championshipEditions() {
        return Context.game.championshipEditions.filterByIds(this._championshipEditionsIds);
    }

    get currentDate() {
        return this.currentSeasonDate.date;
    }

    get isFinished() {
        return this._currentSeasonDateIndex === this.seasonDates.length - 1;
    }

    get seasonDates() {
        return Context.game.seasonDates.filterByIds(this._seasonDateIds);
    }

    get currentSeasonDate() {
        return this.seasonDates[this._currentSeasonDateIndex];
    }

    get previousDate() {
        return this.previousSeasonDate.date;
    }

    get previousSeasonDate() {
        return this.seasonDates[this._currentSeasonDateIndex - 1];
    }

    advanceDate() {
        this._currentSeasonDateIndex++;
    }

    getChampionshipEditionsByConfederation(confederationId) {
        const championshipEditions = this.getNationalChampionshipEditions();
        return championshipEditions.filter(ce => ce.championship.confederation.id === confederationId);
    }

    getChampionshipEditionCurrentEliminationPhase(championshipEdition) {
        return championshipEdition.championshipEditionEliminationPhases
            .find(ceep => ceep.seasonDates.map(sd => sd.id).includes(this.currentSeasonDate.id));
    }

    getChampionshipEditionCurrentFixture(championshipEdition) {
        return championshipEdition.championshipEditionFixtures
            .find(cef => cef.seasonDate.id === this.currentSeasonDate.id);
    }

    getChampionshipEditionCurrentStage(championshipEdition) {
        const fixture = this.getChampionshipEditionCurrentFixture(championshipEdition);

        if (fixture) {
            return fixture;
        }

        return this.getChampionshipEditionCurrentEliminationPhase(championshipEdition);
    }

    getChampionshipEditionNextEliminationPhase(championshipEdition) {
        return championshipEdition.championshipEditionEliminationPhases
            .find(ceep => ceep.seasonDates[0].date > this.currentDate);
    }

    getCurrentChampionshipEditions() {
        return this.currentSeasonDate.matches.map(m => m.championshipEdition).distinct();
    }

    getCurrentMatchesByChampionshipEdition(championshipEdition) {
        return this.currentSeasonDate.matches.filter(m => m.championshipEdition.id === championshipEdition.id);
    }

    getInternationalChampionshipEditions() {
        return this.championshipEditions.filter(ce => !ce.championship.championshipType.scope === 'national');
    }

    getNationalChampionshipEditions() {
        return this.championshipEditions.filter(ce => ce.championship.championshipType.scope === 'national');
    }

    getNationalLeagues() {
        return this.championshipEditions.filter(ce => ce.championship.isNationalLeague);
    }

    getNationalLeaguesByCountry(country) {
        const championshipEditions = this.getNationalLeagues();
        return championshipEditions.filter(ce => ce.championship.countries.map(c => c.id).includes(country.id));
    }

    getMatchesByClub(club) {
        const matches = this.championshipEditions.flatMap(ce => ce.matches);
        return matches.filter(m => m.clubs?.map(c => c.id).includes(club.id)).orderBy('date');
    }

    schedule() {
        this._defineChampionshipEditions();
        this._defineCalendar();
        this._defineChampionshipEditionClubs();
        this._scheduleMatches();
    }

    _addSeasonDate(date, isTransferWindow, championshipType) {
        const seasonDate = SeasonDate.create(this, date, isTransferWindow, championshipType);
        this._seasonDateIds.push(seasonDate.id);
    }

    _defineCalendar() {
        const nationalSupercup = ChampionshipType.find('national', 'supercup');
        const continentalSupercup = ChampionshipType.find('continental', 'supercup');
        const worldCup = ChampionshipType.find('world', 'cup');

        let date = Date.firstSunday(1, this.year);

        while (date.getMonth() === 1) {
            this._addSeasonDate(date, true, null);
            date = date.addDays(date.getDay() === 0 ? 7 : 4);
        }

        this._addSeasonDate(date, false, nationalSupercup);
        date = date.addDays(7);
        this._addSeasonDate(date, false, continentalSupercup);

        const championshipTypes = this.championshipTypes.filter(ct => ct.format !== 'supercup' && ct.scope !== 'world');
        let pendingChampionshipTypes = [];

        while ((pendingChampionshipTypes = championshipTypes.filter(ct => !this._isTotallyScheduled(ct))).length > 0) {
            const isTransferWindow = date.getMonth() === 6;

            if (isTransferWindow || pendingChampionshipTypes.length === 1)
                date = date.addDays(date.getDay() === 0 ? 7 : 4);
            else
                date = date.addDays(date.getDay() === 0 ? 3 : 4);

            if (isTransferWindow) {
                this._addSeasonDate(date, isTransferWindow, null);
            }
            else {
                this._addSeasonDate(date, isTransferWindow, pendingChampionshipTypes[0]);
                championshipTypes.rotate();
            }
        }

        date = date.addDays(date.getDay() === 0 ? 7 : 11);
        this._addSeasonDate(date, false, worldCup);
    }

    _defineChampionshipEditions() {
        const championships = this.championshipTypes.flatMap(ct => ct.championships);
        for (const championship of championships) {
            const championshipEdition = ChampionshipEdition.create(championship, this);
            this._championshipEditionsIds.push(championshipEdition.id);
        }
    }

    _defineChampionshipEditionClubs() {
        const nationalLeague = ChampionshipType.find('national', 'league');

        for (const championshipEdition of this.championshipEditions) {
            let eligibleClubs = Context.game.clubs.filter(c => c.isPlayable);
            if (eligibleClubs.length === 0)
                throw new Error();

            if (championshipEdition.championship.countries != null) {
                eligibleClubs = eligibleClubs.filter(club => championshipEdition.championship.countries.some(country => club.country.id === country.id));

                if (championshipEdition.championship.championshipType.id === nationalLeague.id) {
                    const otherDivisions = this.championshipEditions.filter(ce =>
                        ce.championship.championshipType.id === nationalLeague.id &&
                        ce.championship.countries.map(c => c.id).includes(championshipEdition.championship.countries[0].id) &&
                        ce.championship.division !== championshipEdition.championship.division);

                    const alreadyChosenClubs = otherDivisions.flatMap(ce => ce.clubs);
                    eligibleClubs = eligibleClubs.filter(c => !alreadyChosenClubs.some(chosenClub => c.id === chosenClub.id));
                }
            }

            const orderBy = this.isFirst ? '-overall' : '-lastSeasonLeaguePosition';
            eligibleClubs = eligibleClubs.orderBy(orderBy);
            const clubCount = championshipEdition.championship.clubCount;
            const clubs = eligibleClubs.take(clubCount);

            let bracketOrder = 0;
            for (const club of clubs)
                ChampionshipEditionClub.create(championshipEdition, club, ++bracketOrder);
        }
    }

    _isTotallyScheduled(championshipType) {
        const scheduledDates = this.seasonDates.filter(sd => sd.championshipType === championshipType).length;
        const championshipEditions = this.championshipEditions.filter(ce => ce.championship.championshipType === championshipType);
        const listDateCount = championshipEditions.map(ce => ce.championship.getDateCount());
        const neededDates = listDateCount.max();
        return scheduledDates === neededDates;
    }

    _scheduleMatches() {
        for (const championshipEdition of this.championshipEditions) {
            const seasonDates = this.seasonDates.filter(sd => sd.championshipType?.id === championshipEdition.championship.championshipType.id);
            const dateCount = championshipEdition.championship.getDateCount();
            championshipEdition.addSeasonDates(seasonDates.lastItems(dateCount));
            championshipEdition.scheduleMatches();
        }
    }
}