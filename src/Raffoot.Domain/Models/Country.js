class Country {
    constructor(name, continentId) {
        this.name = name;
        this._continentId = continentId;
        this._clubIds = [];
    }

    static create(name, continentId) {
        const country = new Country(name, continentId);
        country.id = Context.game.countries.push(country);        
        return country;
    }

    static getById(id) {
        return Context.game.countries[id - 1];
    }

    static getByName(name) {
        return Context.game.countries.find(c => c.name === name);
    }

    get continent() {
        return Continent.getById(this._continentId);
    }

    get clubs() {
        return Context.game.clubs.filterByIds(this._clubIds);
    }

    get hasClubs() {
        return this.clubs.length > 0;
    }

    addClub(club) {
        this._clubIds.push(club.id);
    }

    getFlagURL() {
        return `${Config.folders.flagsFolder}/${this.name}.png`;
    }
}