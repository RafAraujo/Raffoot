class ChampionshipEditionFixture {
    constructor(championshipEditionId, number) {
        this._championshipEditionId = championshipEditionId;
        this.number = number;
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
    }

    get name() {
        return `Fixture ${number}`;
    }
}