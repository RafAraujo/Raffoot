class Confederation {
    constructor(name, continentId, countryIds, mainContinentalCupSpots, secondaryContinentalCupSpots) {
        this.name = name;
        this._continentId = continentId;
        this._countryIds = countryIds;
        this.mainContinentalCupSpots = mainContinentalCupSpots;
        this.secondaryContinentalCupSpots = secondaryContinentalCupSpots;
    }

    static create(continent, name, countryNames, mainContinentalCupSpots, secondaryContinentalCupSpots) {
        const countryIds = countryNames.map(cn => Country.getByName(cn)).map(c => c.id);
        const confederation = new Confederation(name, continent.id, countryIds, mainContinentalCupSpots, secondaryContinentalCupSpots);
        confederation.id = Context.game.confederations.push(confederation);

        continent.addConfederation(confederation);

        return confederation;
    }

    static getById(id) {
        return Context.game.confederations[id - 1];
    }

    static getByName(name) {
        return Context.game.confederation.find(c => c.name === name);
    }

    static seed() {
        const america = Continent.getByName('America');
        const asia = Continent.getByName('Asia');
        const europe = Continent.getByName('Europe');

        Confederation.create(america, 'Argentina', ['Argentina'], 4, 3);
        Confederation.create(america, 'Brazil', ['Brazil'], 4, 3);
        Confederation.create(america, 'North America', ['Mexico', 'United States'], 4, 3);
        Confederation.create(america, 'South America', ['Bolivia', 'Colombia', 'Ecuador', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela'], 4, 3);

        Confederation.create(asia, 'Australia', ['Australia', 'South Africa', 'United Arab Emirates'], 4, 3);
        Confederation.create(asia, 'Korea-Japan', ['Japan', 'Korea Republic'], 4, 3);
        Confederation.create(asia, 'Indochina', ['China PR', 'India'], 4, 3);
        Confederation.create(asia, 'Saudi Arabia', ['Saudi Arabia'], 4, 3);

        Confederation.create(europe, 'England', ['England'], 4, 1);
        Confederation.create(europe, 'France', ['France'], 3, 2);
        Confederation.create(europe, 'Germany', ['Germany'], 4, 1);
        Confederation.create(europe, 'Italy', ['Italy'], 4, 1);
        Confederation.create(europe, 'Portugal', ['Portugal'], 3, 2);
        Confederation.create(europe, 'Spain', ['Spain'], 4, 1);
        Confederation.create(europe, 'BeNe', ['Belgium', 'Netherlands'], 3, 2);
        Confederation.create(europe, 'British Isles', ['Republic of Ireland', 'Scotland'], 1, 2);
        Confederation.create(europe, 'Centre Europe', ['Austria', 'Czech Republic', 'Switzerland'], 1, 2);
        Confederation.create(europe, 'Eastern Europe', ['Croatia', 'Poland', 'Romania', 'Ukraine'], 1, 2);
        Confederation.create(europe, 'Eurasia', ['Cyprus', 'Greece', 'Russia', 'Turkey'], 2, 2);
        Confederation.create(europe, 'Scandinavia', ['Denmark', 'Finland', 'Norway', 'Sweden'], 2, 2);
    }

    get continent() {
        return Continent.getById(this._continentId);
    }

    get countries() {
        return Context.game.countries.filterByIds(this._countryIds);
    }

    get clubs() {
        return this.countries.flatMap(c => c.clubs);
    }
    
    getContinentalCupSpots(continentalCupDivision) {
        switch (continentalCupDivision) {
            case 1:
                return this.mainContinentalCupSpots;
            case 2:
                return this.secondaryContinentalCupSpots;
        }

        return 0;
    }
}