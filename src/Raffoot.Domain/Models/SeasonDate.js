class SeasonDate {
    constructor(seasonId, date, isTransferWindow, championshipTypeId) {
        this._seasonId = seasonId;
        this.date = date;
        this.isTransferWindow = isTransferWindow;
        this._championshipTypeId = championshipTypeId;
        this._matchIds = [];
    }

    static create(season, date, isTransferWindow, championshipType) {
        const seasonDate = new SeasonDate(season.id, date, isTransferWindow, championshipType?.id ?? null);
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
        return Context.game.matches.filterByIds(this._matchIds);
    }

    get season() {
        return Season.getById(this._seasonId);
    }

    addMatch(match) {
        this._matchIds.push(match.id);
    }
}