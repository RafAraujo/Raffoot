class Confederation {
    constructor(name, continentId, countryIds, continentalCupSpots) {
        this.name = name;
        this._continentId = continentId;
        this._countryIds = countryIds;
        this.continentalCupSpots = continentalCupSpots;
    }

    static create(continent, name, countryNames, continentalCupSpots) {
        const countryIds = countryNames.map(cn => Country.getByName(cn)).filter(c => c).map(c => c.id);
        const confederation = new Confederation(name, continent.id, countryIds, continentalCupSpots);
        confederation.id = Context.game.confederations.push(confederation);

        continent.addConfederation(confederation);

        return confederation;
    }

    static getById(id) {
        return Context.game.confederations[id - 1];
    }

    static getByName(name) {
        return Context.game.confederations.find(c => c.name === name);
    }

    static seed(isFantasyMode) {
        const america = Continent.getByName('America');
        const asia = Continent.getByName('Asia');
        const europe = Continent.getByName('Europe');

        if (isFantasyMode) {
            Confederation.create(america, 'Fantasy', Country.all().map(c => c.name), [0, 0]);
            return;
        }

        Confederation.create(america, 'Argentina', ['Argentina'], [4, 3]);
        Confederation.create(america, 'Brazil', ['Brazil'], [4, 3]);
        Confederation.create(america, 'North America', ['Canada', 'Mexico', 'United States'], [4, 3]);
        Confederation.create(america, 'South America', ['Bolivia', 'Colombia', 'Ecuador', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela'], [4, 3]);

        Confederation.create(asia, 'Australia', ['Australia', 'South Africa', 'United Arab Emirates'], [4, 3]);
        Confederation.create(asia, 'Korea-Japan', ['Japan', 'Korea Republic'], [4, 3]);
        Confederation.create(asia, 'Indochina', ['China PR', 'India'], [4, 3]);
        Confederation.create(asia, 'Saudi Arabia', ['Saudi Arabia'], [4, 3]);

        Confederation.create(europe, 'England', ['England'], [4, 1]);
        Confederation.create(europe, 'France', ['France'], [3, 2]);
        Confederation.create(europe, 'Germany', ['Germany'], [4, 1]);
        Confederation.create(europe, 'Italy', ['Italy'], [4, 1]);
        Confederation.create(europe, 'Portugal', ['Portugal'], [3, 2]);
        Confederation.create(europe, 'Spain', ['Spain'], [4, 1]);
        Confederation.create(europe, 'Benelux', ['Belgium', 'Netherlands', 'Luxembourg'], [3, 2]);
        Confederation.create(europe, 'British Isles', ['Republic of Ireland', 'Scotland'], [1, 2]);
        Confederation.create(europe, 'Centre Europe', ['Austria', 'Czechia', 'Switzerland'], [1, 2]);
        Confederation.create(europe, 'Eastern Europe', ['Croatia', 'Poland', 'Romania', 'Ukraine'], [1, 2]);
        Confederation.create(europe, 'Eurasia', ['Cyprus', 'Greece', 'Russia', 'Türkiye'], [2, 2]);
        Confederation.create(europe, 'Scandinavia', ['Denmark', 'Finland', 'Norway', 'Sweden'], [2, 2]);
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

    get isPlayable() {
        return this.clubs.length > Config.nationalLeague.minClubCount;
    }
    
    getContinentalCupSpots(continentalCupDivision) {
        return this.continentalCupSpots[continentalCupDivision - 1];
    }
}