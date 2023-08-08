class Season {
    constructor(year, championshipTypeIds) {
        this.year = year;
        this._championshipTypeIds = championshipTypeIds;
        this._championshipEditionsIds = [];
        this._seasonDateIds = [];
        this._currentSeasonDateIndex = 0;
        this.finished = false;
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
        return Context.game.championshipEditions.filter(ce => ce.year == this.year);
    }

    get seasonDates() {
        return Context.game.seasonDates.filterByIds(this._seasonDateIds);
    }

    get currentSeasonDate() {
        return this.seasonDates[this._currentSeasonDateIndex];
    }

    get previousSeasonDate() {
        return this.seasonDates[this._currentSeasonDateIndex - 1];
    }

    get currentDate() {
        return this.currentSeasonDate.date;
    }

    get matches() {
        return this.championshipEditions.map(ce => ce.matches).flat();
    }

    schedule() {
        this._defineChampionshipEditions();
        this._defineCalendar();

        for (let ce of this.championshipEditions) {
            this._defineChampionshipEditionClubs(ce);
            const dates = this.seasonDates.filter(sd => sd.championshipType.id === ce.championship.championshipType.id).map(sd => sd.date);
            ce.scheduleMatches(dates.lastItems(ce.championship.dateCount));
        }
    }

    mainContinentalCup(confederation) {
        return this._championshipEditions.find(c => c.championship.confederation === confederation && c.championship.division === 1);
    }

    _defineChampionshipEditions() {
        const championships = this.championshipTypes.flatMap(ct => ct.championships);
        for (let championship of championships) {
            const championshipEdition = ChampionshipEdition.create(championship, this.year);
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
                const otherDivisions = Context.game.championshipEditions.filter(ce =>
                    ce.year == this.year &&
                    ce.championship.championshipType.id === nationalLeague.id &&
                    ce.championship.countries.map(c => c.id).includes(championshipEdition.championship.countries[0].id) &&
                    ce.championship.division !== championshipEdition.championship.division);

                const alreadyChosenClubs = otherDivisions.flatMap(ce => ce.clubs);
                eligibleClubs = eligibleClubs.filter(c => !alreadyChosenClubs.some(chosenClub => c.id === chosenClub.id));
            }
        }

        const clubs = eligibleClubs.orderBy('-overall').take(clubCount);
        for (let club of clubs) {
            championshipEdition.addClub(club);
        }
    }

    _defineCalendar() {
        const nationalSupercup = ChampionshipType.find('national', 'supercup');
        const internationalSupercup = ChampionshipType.find('international', 'supercup');

        let date = Date.firstSunday(1, this.year);
        this._addSeasonDate(date, nationalSupercup);
        date = date.addDays(3);
        this._addSeasonDate(date, internationalSupercup);

        let championshipTypes = this.championshipTypes.slice();
        let championshipType = null;
        while (championshipType = championshipTypes.find(ct => !this._totallyScheduled(ct))) {
            date = date.addDays(date.getDay() === 0 ? 3 : 4);
            if (date.getMonth() === 6)
                continue;
            this._addSeasonDate(date, championshipType);
            championshipTypes.rotate();
        }

        date = date.addDays(date.getDay() === 0 ? 3 : 4);
    }

    _addSeasonDate(date, championshipType) {
        if (this.championshipTypes.includes(championshipType))
            this._seasonDateIds.push(SeasonDate.create(date, championshipType).id);
    }

    _totallyScheduled(championshipType) {
        const scheduledDates = this.seasonDates.filter(sd => sd.championshipType === championshipType).length;
        const neededDates = this.championshipEditions
            .filter(ce => ce.championship.championshipType === championshipType)
            .map(ce => ce.championship.dateCount)
            .max();

        return scheduledDates === neededDates;
    }

    advanceDate() {
        const previousDate = this.currentDate;
        this._currentSeasonDateIndex++;
        const days = Date.daysDiff(previousDate, this.currentDate);

        for (let club of Context.game.clubs) {
            club.squad.rest(days);
            if (this._currentSeasonDateIndex > 0 && this.currentDate.getMonth() > this.previousSeasonDate.date.getMonth())
                club.payWages();
        }

        this.finished = this._currentSeasonDateIndex === this.seasonDates.length;
    }

    getMatchesByDate(date) {
        return this.matches.filter(m => m.date.getTime() === date.getTime());
    }

    getMatchesByClubId(clubId) {
        return this.matches.filter(m => m.matchClubs.map(mc => mc.club?.id).includes(clubId)).orderBy('date');;
    }

    getNextMatch(clubId) {
        return this.getMatchesByClubId(clubId).find(m => m.date >= this.currentDate);
    }
}