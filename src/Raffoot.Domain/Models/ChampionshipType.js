class ChampionshipType {
    constructor(scope, format, isTwoLeggedTie, order) {
        this.scope = scope;
        this.format = format;
        this.isTwoLeggedTie = isTwoLeggedTie;
        this.order = order;
        this._championshipIds = [];
    }

    static create(scope, format, isTwoLeggedTie) {
        const championshipType = new ChampionshipType(scope, format, isTwoLeggedTie);
        championshipType.id = Context.game.championshipTypes.push(championshipType);
        return championshipType;
    }

    static getById(id) {
        return Context.game.championshipTypes[id - 1];
    }

    static seed() {
        ChampionshipType.create('national', 'league', true, 3);
		ChampionshipType.create('national', 'cup', true, 4);
		ChampionshipType.create('national', 'supercup', false, 1);
		ChampionshipType.create('continental', 'cup', true, 5);
		ChampionshipType.create('continental', 'supercup', false, 2);
		ChampionshipType.create('world', 'cup', false, 6);
	}

    static find(scope, format) {
        return Context.game.championshipTypes.find(ct => ct.scope === scope && ct.format === format);
    }

    get championships() {
        return Context.game.championships.filterByIds(this._championshipIds);
    }

    get name() {
        return `${this.scope} ${this.format}`;
    }

    addChampionship(championship) {
        this._championshipIds.push(championship.id);
    }
}