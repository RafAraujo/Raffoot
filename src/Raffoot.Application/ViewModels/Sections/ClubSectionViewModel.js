class ClubSectionViewModel {
    constructor(game, translator) {
        this.controller = new ClubSectionController(game, translator);
        this.selectedCountryId = game.club.country.id;
        this.selectedClubId = game.club.id;
        this.playerOrder = new PlayerOrderViewModel();
    }

    get selectedClub() {
        return this.controller.getClubById(this.selectedClubId);
    }

    get clubs() {
        return this.controller.getClubsByCountryId(this.selectedCountryId);
    }

    get countries() {
        return this.controller.getCountries();
    }

    get players() {
        return this.controller.getPlayers(this.selectedClubId, [this.playerOrder.orderColumn, 'position.id', '-overall', 'name'])
    }

    get kitsURLs() {
        return this.controller.getKitsURLs(this.selectedClubId);
    }

    selectCountry(countryId) {
        this.selectedCountryId = parseInt(countryId);
        this.selectedClubId = null;
    }

    selectClub(clubId) {
        this.selectedClubId = parseInt(clubId);
    }
}