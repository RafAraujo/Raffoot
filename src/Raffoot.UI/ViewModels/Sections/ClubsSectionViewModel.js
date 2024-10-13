class ClubsSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        
        this.selectedCountryId = game.club.country.id;
        this.selectedClubId = game.club.id;
        this.playerOrder = new PlayerOrderViewModel('position.id');
    }

    get selectedClub() {
        return Club.getById(this.selectedClubId);
    }

    getClubs() {
        const clubs = this.game.clubs
            .filter(c => c.country.id === this.selectedCountryId)
            .orderBy('name');

        return clubs;
    }

    getCountries() {
        const countries = this.game.clubs
            .flatMap(c => c.country)
            .distinct()
            .map(c => ({ id: c.id, name: this.translator.get(c.name) }))
            .orderBy('name');
            
        return countries;
    }

    getPlayers() {
        const orderColumns = [this.playerOrder.orderColumn, 'position.id', '-overall', 'name'];
        return this.selectedClub.players.orderBy(...orderColumns);
    }
    
    getKitsURLs() {
        return this.selectedClub.getKitsURLs();
    }

    selectCountry(countryId) {
        this.selectedCountryId = parseInt(countryId);
        this.selectedClubId = null;
    }

    selectClub(clubId) {
        this.selectedClubId = parseInt(clubId);
    }
}