class Continent {
    constructor(name, mainCupName, secondaryCupName) {
        this.name = name;
        this.mainCupName = mainCupName;
        this.secondaryCupName = secondaryCupName;
        this._confederationIds = [];
    }

    static create(name, mainCupName, secondaryCupName) {
        const continent = new Continent(name, mainCupName, secondaryCupName);
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
		Continent.create('Africa', 'Africa Champions Cup', 'Africa Conference Cup');
		Continent.create('America', 'Copa Libertadores', 'Copa Sudamericana');
		Continent.create('Asia', 'Asia Champions Cup', 'Asia Conference Cup');
		Continent.create('Europe', 'Champions League', 'Europa League');
	}

    get confederations() {
        return Context.game.confederations.filterByIds(this._confederationIds);
    }

    get countries() {
        return this.confederations.flatMap(c => c.countries);
    }

    addConfederation(confederation) {
        this._confederationIds.push(confederation.id);
    }

    getContinentalCupName(continentalCupDivision) {
        switch (continentalCupDivision) {
            case 1:
                return this.mainCupName;
            case 2:
                return this.secondaryCupName;
        }

        return null;
    }

    getContinentalCupSpots(continentalCupDivision) {
        return this.confederations.flatMap(c => c.getContinentalCupSpots(continentalCupDivision)).sum();
    }
}