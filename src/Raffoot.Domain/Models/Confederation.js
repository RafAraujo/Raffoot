class Confederation {
    constructor(name, continentId, countryIds) {
        this.name = name;
        this._continentId = continentId;
        this._countryIds = countryIds;
        this.continentalCupSlots = [0, 0];
    }

    static create(continent, name, countryNames) {
        const countryIds = countryNames.map(cn => Country.getByName(cn)).filter(c => c).map(c => c.id);
        const confederation = new Confederation(name, continent?.id ?? null, countryIds);
        confederation.id = Context.game.confederations.push(confederation);

        continent?.addConfederation(confederation);

        return confederation;
    }

    static getById(id) {
        return Context.game.confederations[id - 1];
    }

    static getByName(name) {
        return Context.game.confederations.find(c => c.name === name);
    }

    static seed(combineCountries) {
        const continents = Continent.all();
        const countries = Country.all().filter(c => c.isPlayable && c.continent);

        if (combineCountries) {
            for (const continent of continents)
                for (const subdivision of continent.subdivisions)
                    Confederation.create(continent, subdivision.name, subdivision.countryNames);
            
            const subdivisionsCountryNames = continents.flatMap(c => c.subdivisions).flatMap(s => s.countryNames);
            const singleCountries = countries.filter(c => !subdivisionsCountryNames.includes(c.name));
            for (const country of singleCountries)
                Confederation.create(country.continent, country.name, [country.name]);
        }
        else {
            for (const country of countries)
                Confederation.create(country.continent, country.name, [country.name]);
        }
    }

    static seedForFantasyMode() {
        Confederation.create(null, 'Fantasy', Country.all().map(c => c.name));
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

    get overall() {
        return this.clubs.take(Config.nationalLeague.maxClubCount).flatMap(c => c.players).map(p => p.overall).average();
    }

    addContinentalCupSlot(continentalCupDivision) {
        this.continentalCupSlots[continentalCupDivision - 1]++;
    }

    getContinentalCupSlots(continentalCupDivision) {
        return this.continentalCupSlots[continentalCupDivision - 1];
    }

    setContinentalCupSlots(value, continentalCupDivision) {
        this.continentalCupSlots[continentalCupDivision - 1] = value;
    }
}