class ChampionshipEditionFixture {
    constructor(championshipEditionId, number) {
        this._championshipEditionId = championshipEditionId;
        this.number = number;
        this._seasonDateId = null;
        this._matchIds = [];
    }

    static create(championshipEdition, number) {
        const championshipEditionFixture = new ChampionshipEditionFixture(championshipEdition.id, number);
        championshipEditionFixture.id = Context.game.championshipEditionFixtures.push(championshipEditionFixture);
        return championshipEditionFixture;
    }

    static getById(id) {
        return Context.game.championshipEditionFixtures[id - 1];
    }

    get championshipEdition() {
        return ChampionshipEdition.getById(this._championshipEditionId);
    }

    get matches() {
        return Context.game.matches.filterByIds(this._matchIds);
    }

    get name() {
        return `Fixture ${number}`;
    }

    get seasonDate() {
        return SeasonDate.getById(this._seasonDateId);
    }

    set seasonDate(value) {
        this._seasonDateId = value.id;
    }

    addMatch(match) {
        this._matchIds.push(match.id);
    }
}