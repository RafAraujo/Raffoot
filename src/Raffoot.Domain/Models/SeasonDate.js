class SeasonDate {
    constructor(seasonId, date, championshipTypeId) {
        this._seasonId = seasonId;
        this.date = date;
        this._championshipTypeId = championshipTypeId;
        this._matchIds = [];
    }

    static create(season, date, championshipType) {
        const seasonDate = new SeasonDate(season.id, date, championshipType.id);
        seasonDate.id = Context.game.seasonDates.push(seasonDate);
        return seasonDate;
    }

    static getById(id) {
        return Context.game.seasonDates[id - 1];
    }

    get championshipType() {
        return ChampionshipType.getById(this._championshipTypeId);
    }

    get matches() {
        return this.season.matches.filterByIds(this._matchIds);
    }

    get season() {
        return Season.getById(this._seasonId);
    }

    addMatch(match) {
        this._matchIds.push(match.id);
    }
}