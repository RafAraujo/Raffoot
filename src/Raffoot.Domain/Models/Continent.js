class Continent {
    constructor(name, cupNames) {
        this.name = name;
        this.cupNames = cupNames;
        this._confederationIds = [];
    }

    static create(name, cupNames) {
        const continent = new Continent(name, cupNames);
        continent.id = Context.game.continents.push(continent);
        return continent;
    }

    static getById(id) {
        return Context.game.continents[id - 1];
    }

    static getByName(name) {
        return Context.game.continents.find(c => c.name === name);
    }

    static seed() {
		Continent.create('Africa', ['Africa Champions Cup', 'Africa Conference Cup']);
		Continent.create('America', ['Copa Libertadores', 'Copa Sudamericana']);
		Continent.create('Asia', ['Asia Champions Cup', 'Asia Conference Cup']);
		Continent.create('Europe', ['Champions League', 'Europa League']);
	}

    get confederations() {
        return Context.game.confederations.filterByIds(this._confederationIds);
    }

    get countries() {
        return this.confederations.flatMap(c => c.countries);
    }

    get clubs() {
        return this.countries.flatMap(c => c.clubs);
    }

    addConfederation(confederation) {
        this._confederationIds.push(confederation.id);
    }

    getContinentalCupName(continentalCupDivision) {
        return this.cupNames[continentalCupDivision - 1];
    }

    getContinentalCupSpots(continentalCupDivision) {
        return this.confederations.flatMap(c => c.getContinentalCupSpots(continentalCupDivision)).sum();
    }
}