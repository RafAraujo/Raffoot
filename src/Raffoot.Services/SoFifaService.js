class SoFifaService {
    static getService() {
        return SoFifa23Service;
    }

    static seedCountries() {
        SoFifaService.getService().seedCountries();
    }

    static seedClubs() {
        SoFifaService.getService().seedClubs();
    }
}