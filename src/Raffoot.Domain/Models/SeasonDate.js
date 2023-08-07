class SeasonDate {
    constructor(date, championshipTypeId) {
        this.date = date;
        this._championshipTypeId = championshipTypeId;
    }

    static create(date, championshipType) {
        const seasonDate = new SeasonDate(date, championshipType.id);
        seasonDate.id = Context.game.seasonDates.push(seasonDate);
        return seasonDate;
    }

    static getById(id) {
        return Context.game.seasons[id - 1];
    }

    get championshipType() {
        return ChampionshipType.getById(this._championshipTypeId);
    }
}