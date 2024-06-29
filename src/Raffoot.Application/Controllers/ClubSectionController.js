class ClubSectionController {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getClubById(clubId) {
        return Club.getById(clubId);
    }

    getClubsByCountryId(countryId) {
        const clubs = this.game.clubs
            .filter(c => c.country.id === countryId)
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

    getKitsURLs(clubId) {
        const club = this.getClubById(clubId);
        const urlList = club.getKitsURLs();
        return urlList;
    }

    getPlayers(clubId, orderColumns) {
        const club = this.getClubById(clubId);
        const players = club.players.orderBy(...orderColumns);
        return players;
    }
}