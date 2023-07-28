class Country {
    constructor(name) {
        this.name = name;
        this._clubIds = [];
    }

    static create(name) {
        let country = new Country(name);
        country.id = Context.game.countries.push(country);
        return country;
    }

    static getById(id) {
        return Context.game.countries[id - 1];
    }

    static getByName(name) {
        return Context.game.countries.find(c => c.name === name);
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

    async getFlagURL() {
        return `${Config.folders.flagsFolder}/${this.name}.png`;
    }
}