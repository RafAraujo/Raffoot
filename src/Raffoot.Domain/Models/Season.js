class Season {
    constructor(year, championshipTypeIds) {
        this.year = year;
        this._championshipTypeIds = championshipTypeIds;
        this._championshipEditionsIds = [];
        this._seasonDateIds = [];
        this._currentSeasonDateIndex = 0;
    }

    static create(year, championshipTypes) {
        const championshipTypeIds = championshipTypes.map(ct => ct.id);
        const season = new Season(year, championshipTypeIds);
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

    get finished() {
        return this._currentSeasonDateIndex === this.seasonDates.length;
    }

    get seasonDates() {
        return Context.game.seasonDates.filterByIds(this._seasonDateIds);
    }

    get currentSeasonDate() {
        return this.seasonDates[this._currentSeasonDateIndex];
    }

    get matches() {
        return this.championshipEditions.flatMap(ce => ce.matches);
    }

    get previousSeasonDate() {
        return this.seasonDates[this._currentSeasonDateIndex - 1];
    }

    advanceDate() {
        const previousDate = this.currentDate;
        this._currentSeasonDateIndex++;
        const days = Date.daysDiff(previousDate, this.currentDate);

        for (const club of Context.game.clubs) {
            club.squad.rest(days);
            if (this._currentSeasonDateIndex > 0 && this.currentDate.getMonth() > this.previousSeasonDate.date.getMonth()) {
                club.payWages();
            }
        }
    }

    getInternationalChampionshipEditions() {
        return this.championshipEditions.filter(ce => !ce.championship.championshipType.scope === 'national');
    }

    getNationalChampionshipEditions() {
        return this.championshipEditions.filter(ce => ce.championship.championshipType.scope === 'national');
    }

    getChampionshipEditionsByConfederation(confederation) {
        const championshipEditions = this.getNationalChampionshipEditions();
        return championshipEditions.filter(ce => ce.championship.confederation.id === confederation.id);
    }

    getChampionshipEditionCurrentStage(championshipEdition) {
        if (championshipEdition.championship.championshipType.regulation === 'round-robin') {
            const fixture = championshipEdition.championshipEditionFixtures.find(cef => cef.seasonDate.id === this.currentSeasonDate.id);
            return fixture.number;
        }
    }

    getCurrentChampionshipEditions() {
        return this.currentSeasonDate.matches.map(m => m.championshipEdition).distinct();
    }

    getCurrentMatchesByChampionshipEdition(championshipEdition) {
        return this.currentSeasonDate.matches.filter(m => m.championshipEdition.id === championshipEdition.id);
    }

    getNationalLeagues() {
        return this.championshipEditions.filter(ce => ce.championship.isNationalLeague);
    }

    getNationalLeaguesByCountry(country) {
        const championshipEditions = this.getNationalLeagues();
        return championshipEditions.filter(ce => ce.championship.countries.map(c => c.id).includes(country.id));
    }

    getMatchesByClub(club) {
        return this.matches.filter(m => m.clubs?.map(c => c.id).includes(club.id)).orderBy('date');
    }

    schedule() {
        this._defineChampionshipEditions();
        this._defineCalendar();

        for (const championshipEdition of this.championshipEditions) {
            this._defineChampionshipEditionClubs(championshipEdition);
            const seasonDates = this.seasonDates.filter(sd => sd.championshipType.id === championshipEdition.championship.championshipType.id);
            const dateCount = championshipEdition.championship.getDateCount();
            championshipEdition.addSeasonDates(seasonDates.lastItems(dateCount));
            championshipEdition.scheduleMatches();
        }
    }

    _addSeasonDate(date, championshipType) {
        if (this.championshipTypes.includes(championshipType)) {
            const seasonDate = SeasonDate.create(this, date, championshipType);
            this._seasonDateIds.push(seasonDate.id);
        }
    }

    _defineCalendar() {
        const nationalSupercup = ChampionshipType.find('national', 'supercup');
        const continentalSupercup = ChampionshipType.find('continental', 'supercup');
        const worldCup = ChampionshipType.find('world', 'cup');

        let date = Date.firstSunday(1, this.year);
        this._addSeasonDate(date, nationalSupercup);
        date = date.addDays(3);
        this._addSeasonDate(date, continentalSupercup);

        const championshipTypes = this.championshipTypes.filter(ct => ct.format !== 'supercup' && ct.scope !== 'world');
        let championshipType = null;

        while (championshipType = championshipTypes.find(ct => !this._isTotallyScheduled(ct))) {
            date = date.addDays(date.getDay() === 0 ? 3 : 4);

            if (date.getMonth() === 6) {
                continue;
            }
            
            this._addSeasonDate(date, championshipType);
            championshipTypes.rotate();
        }

        date = date.addDays(date.getDay() === 0 ? 3 : 4);
        this._addSeasonDate(date, worldCup);
    }

    _defineChampionshipEditions() {
        const championships = this.championshipTypes.flatMap(ct => ct.championships);
        for (const championship of championships) {
            const championshipEdition = ChampionshipEdition.create(championship, this);
            this._championshipEditionsIds.push(championshipEdition.id);
        }
    }

    _defineChampionshipEditionClubs(championshipEdition) {
        const nationalLeague = ChampionshipType.find('national', 'league');
        const clubCount = championshipEdition.championship.clubCount;
        let eligibleClubs = Context.game.clubs;

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

        eligibleClubs = eligibleClubs.orderBy('division', '-overall');
        const clubs = eligibleClubs.take(clubCount);

        for (const club of clubs) {
            ChampionshipEditionClub.create(championshipEdition, club)
        }
    }

    _isTotallyScheduled(championshipType) {
        const scheduledDates = this.seasonDates.filter(sd => sd.championshipType === championshipType).length;
        const neededDates = this.championshipEditions
            .filter(ce => ce.championship.championshipType === championshipType)
            .map(ce => ce.championship.getDateCount())
            .max();

        return scheduledDates === neededDates;
    }
}