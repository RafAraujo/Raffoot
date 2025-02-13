class Country {
    constructor(name, continentId) {
        this.name = name;
        this._continentId = continentId;
    }

    static create(name, continentId) {
        const country = new Country(name, continentId);
        country.id = Context.game.countries.push(country);        
        return country;
    }

    static all() {
        return Context.game.countries;
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
        return Context.game.clubs.filter(c => c.country.id === this.id);
    }

    get hasClubs() {
        return this.clubs.length > 0;
    }

    getFlagURL() {
        const game = Context.game;
        const extension = Context.game.dataSource === 'Fifa' ? 'png' : 'svg';
        const file = `${this.name}.${extension}`;
        const url = `${Config.resourcesFolder}/image/data sources/${game.dataSource}/countries/${file}`;
        return url;
    }
}