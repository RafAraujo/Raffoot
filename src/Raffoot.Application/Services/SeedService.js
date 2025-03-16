class SeedService {
    constructor(dataSource, year) {
        this.dataSource = dataSource;
        this.year = year;
    }

    getService() {
        const name = `${this.dataSource}${this.year.toString().substring(2)}Service`;
        return eval(name);
    }

    seedCountries() {
        return this.getService().seedCountries();
    }

    seedClubs() {
        return this.getService().seedClubs();
    }
}