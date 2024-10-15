class ClubsSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        
        this.selectedCountry = game.club.country;
        this.selectedClub = game.club;
        this.playerOrder = new PlayerOrderViewModel('position.id');
    }

    getClubs() {
        const clubs = this.game.clubs
            .filter(c => c.country.id === this.selectedCountry.id)
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

    getKitsURLs() {
        return this.selectedClub.getKitsURLs();
    }

    getPlayers() {
        const orderColumns = [this.playerOrder.orderColumn, 'position.id', '-overall', 'name'];
        return this.selectedClub.players.orderBy(...orderColumns);
    }

    selectClub(id) {
        this.selectedClub = id ? Club.getById(parseInt(id)) : null;
    }

    selectCountry(id) {
        this.selectedCountry = id ? Country.getById(parseInt(id)) : null;
    }
}