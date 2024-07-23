class ClubSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        
        this.selectedCountryId = game.club.country.id;
        this.selectedClubId = game.club.id;
        this.playerOrder = new PlayerOrderViewModel();
    }

    get selectedClub() {
        return Club.getById(this.selectedClubId);
    }

    get clubs() {
        const clubs = this.game.clubs
            .filter(c => c.country.id === this.selectedCountryId)
            .orderBy('name');

        return clubs;
    }

    get countries() {
        const countries = this.game.clubs
            .flatMap(c => c.country)
            .distinct()
            .map(c => ({ id: c.id, name: this.translator.get(c.name) }))
            .orderBy('name');
            
        return countries;
    }

    get kitsURLs() {
        return this.selectedClub.getKitsURLs();
    }

    get players() {
        const orderColumns = [this.playerOrder.orderColumn, 'position.id', '-overall', 'name'];
        return this.selectedClub.players.orderBy(...orderColumns);
    }

    selectCountry(countryId) {
        this.selectedCountryId = parseInt(countryId);
        this.selectedClubId = null;
    }

    selectClub(clubId) {
        this.selectedClubId = parseInt(clubId);
    }
}