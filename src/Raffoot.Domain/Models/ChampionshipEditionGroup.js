class ChampionshipEditionGroup {
    constructor(championshipEditionId, number) {
        this._championshipEditionId = championshipEditionId;
        this.number = number;
        this._championshipEditionClubIds = [];
        this._matchIds = [];
    }

    static create(championshipEdition, number) {
        const championshipEditionGroup = new ChampionshipEditionGroup(championshipEdition.id, number);
        championshipEditionGroup.id = Context.game.championshipEditionGroups.push(championshipEditionGroup);
        return championshipEditionGroup;
    }

    static getById(id) {
        return Context.game.championshipEditionGroups[id - 1];
    }

    get championshipEditionClubs() {
        return Context.game.championshipEditionClubs.filterById(this._championshipEditionClubIds);
    }

    get name() {
        return `Group ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[this.number - 1]}`;
    }

    get championshipEdition() {
        return ChampionshipEdition.getById(this._championshipEditionId);
    }

    get matches() {
        return this.championshipEdition.matches.filterById(this._matchIds);
    }

    addChampionshipEditionClub(championshipEditionClub) {
        this._championshipEditionClubIds.push(championshipEditionClub.id);
    }

    addMatches(matches) {
        this._matchIds.concat(matches.map(m => m.id));
    }

    table() {
        return this.championshipEditionClubs.orderBy('-points', '-won', '-goalsDifference', '-goalsFor');
    }
}