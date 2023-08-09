class ChampionshipType {
    constructor(scope, format, regulation, isTwoLeggedTie) {
        this.scope = scope;
        this.format = format;
        this.regulation = regulation;
        this.isTwoLeggedTie = isTwoLeggedTie;
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
		ChampionshipType.create('national', 'cup', 'elimination', true);
		ChampionshipType.create('national', 'league', 'round-robin', true);
		ChampionshipType.create('national', 'supercup', 'elimination', false);
		ChampionshipType.create('continental', 'cup', 'groups', true);
		ChampionshipType.create('continental', 'supercup', 'elimination', false);
		ChampionshipType.create('world', 'cup', 'elimination', false);
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