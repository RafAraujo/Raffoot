class SeedService {
    constructor(mode, year) {
        this.mode = mode;
        this.year = year;
    }

    getService() {
        const prefix = this.mode === 'Default' ? 'Fifa' : 'Fm';
        const name = `${prefix}${this.year.toString().substring(2)}Service`;
        return eval(name);
    }

    seedCountries() {
        return this.getService().seedCountries();
    }

    seedClubs() {
        return this.getService().seedClubs();
    }
}