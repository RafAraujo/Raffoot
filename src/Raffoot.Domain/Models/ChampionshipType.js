class ChampionshipType {
    constructor(scope, format, regulation, isTwoLeggedTie, order) {
        this.scope = scope;
        this.format = format;
        this.regulation = regulation;
        this.isTwoLeggedTie = isTwoLeggedTie;
        this.order = order;
        this._championshipIds = [];
    }

    static create(scope, format, regulation, isTwoLeggedTie) {
        const championshipType = new ChampionshipType(scope, format, regulation, isTwoLeggedTie);
        championshipType.id = Context.game.championshipTypes.push(championshipType);
        return championshipType;
    }

    static getById(id) {
        return Context.game.championshipTypes[id - 1];
    }

    static seed() {
        ChampionshipType.create('national', 'league', 'round-robin', true, 3);
		ChampionshipType.create('national', 'cup', 'elimination', true, 4);
		ChampionshipType.create('national', 'supercup', 'elimination', false, 1);
		ChampionshipType.create('continental', 'cup', 'groups', true, 5);
		ChampionshipType.create('continental', 'supercup', 'elimination', false, 2);
		ChampionshipType.create('world', 'cup', 'elimination', false, 6);
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