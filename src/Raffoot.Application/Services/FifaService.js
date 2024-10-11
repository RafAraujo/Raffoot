class FifaService {
    constructor(year) {
        this.year = year;
    }

    getService() {
        return eval(`Fifa${this.year.toString().substring(2)}Service`);
    }

    seedCountries() {
        return this.getService().seedCountries();
    }

    seedClubs() {
        return this.getService().seedClubs();
    }
}