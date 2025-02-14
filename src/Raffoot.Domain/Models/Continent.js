class Continent {
    constructor(name) {
        this.name = name;
        this.cupConfig = this.getCupConfig();
        this.subdivisions = this.getSubdivisions();
        this._confederationIds = [];
    }

    static all() {
        return Context.game.continents;
    }

    static create(name) {
        const continent = new Continent(name);
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
		Continent.create('Africa');
		Continent.create('America');
		Continent.create('Asia');
		Continent.create('Europe');
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

    getCupConfig() {
        switch (this.name) {
            case 'Africa':
                return [{ name: 'Africa Champions Cup', division: 1, regulation: 'groups' }, { name: 'Africa Conference Cup', division: 2, regulation: 'groups' }];
            case 'America':
                return [{ name: 'Copa Libertadores', division: 1, regulation: 'groups' }, { name: 'Copa Sudamericana', division: 2, regulation: 'groups' }];
            case 'Asia':
                return [{ name: 'Asia Champions Cup', division: 1, regulation: 'groups' }, { name: 'Asia Conference Cup', division: 2, regulation: 'groups' }];
            case 'Europe':
                return [{ name: 'Chhampions League', division: 1, regulation: 'league then elimination' }, { name: 'Europa League', division: 2, regulation: 'league then elimination' }];
        };
    }

    getCupName(continentalCupDivision) {
        return this.cupConfig.find(c => c.division === continentalCupDivision).name;
    }

    getCupRegulation(continentalCupDivision) {
        return this.cupConfig.find(c => c.division === continentalCupDivision).regulation;
    }

    getSubdivisions() {
        switch (this.name) {
            case 'Africa':
                return [];
            case 'America':
                return [
                    { name: 'North America', countryNames: ['Canada', 'Mexico', 'United States'] },
                    { name: 'South America', countryNames: ['Bolivia', 'Chile', 'Colombia', 'Ecuador', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela'] },
                ];
            case 'Asia':
                return [
                    { name: 'Australia', countryNames: ['Australia', 'South Africa', 'United Arab Emirates'] },
                    { name: 'Korea-Japan', countryNames: ['Japan', 'Korea Republic'] },
                    { name: 'Indochina', countryNames: ['China PR', 'India'] },
                ];
            case 'Europe':
                return [
                    { name: 'Benelux', countryNames: ['Belgium', 'Netherlands', 'Luxembourg'] },
                    { name: 'British Isles', countryNames: ['Republic of Ireland', 'Scotland'] },
                    { name: 'Centre Europe', countryNames: ['Austria', 'Czechia', 'Switzerland'] },
                    { name: 'Eastern Europe', countryNames: ['Croatia', 'Poland', 'Romania', 'Ukraine'] },
                    { name: 'Eurasia', countryNames: ['Cyprus', 'Greece', 'Russia', 'Türkiye'] },
                    { name: 'Scandinavia', countryNames: ['Denmark', 'Finland', 'Norway', 'Sweden'] },
                ];
        }
    }
}