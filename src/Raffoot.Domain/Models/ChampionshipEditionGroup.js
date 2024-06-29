class ChampionshipEditionGroup {
    constructor(championshipEditionId, number) {
        this._championshipEditionId = championshipEditionId;
        this.number = number;
        this._championshipEditionClubIds = [];
        this._championshipEditionFixtureIds = [];
    }

    static create(championshipEdition, number, championshipEditionFixtures) {
        const championshipEditionFixtureIds = championshipEditionFixtures.map(cef => cef.id);
        const championshipEditionGroup = new ChampionshipEditionGroup(championshipEdition.id, number, championshipEditionFixtureIds);
        championshipEditionGroup.id = Context.game.championshipEditionGroups.push(championshipEditionGroup);
        return championshipEditionGroup;
    }

    static getById(id) {
        return Context.game.championshipEditionGroups[id - 1];
    }

    get championshipEditionClubs() {
        return Context.game.championshipEditionClubs.filterByIds(this._championshipEditionClubIds);
    }

    get name() {
        return `Group ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[this.number - 1]}`;
    }

    get championshipEdition() {
        return ChampionshipEdition.getById(this._championshipEditionId);
    }

    get championshipEditionFixtures() {
        return Context.game.championshipEditionFixtures.filterByIds(this._championshipEditionFixtureIds);
    }

    get matches() {
        return this.championshipEdition.matches.filterByIds(this._matchIds);
    }

    addChampionshipEditionClub(championshipEditionClub) {
        this._championshipEditionClubIds.push(championshipEditionClub.id);
    }

    table() {
        return this.championshipEditionClubs.orderBy('-points', '-won', '-goalsDifference', '-goalsFor');
    }
}