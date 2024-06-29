class SoFifaService {
    static getService() {
        return SoFifa24Service;
    }

    static seedCountries() {
        SoFifaService.getService().seedCountries();
    }

    static seedClubs() {
        SoFifaService.getService().seedClubs();
    }
}