class PlayersSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.config = Config;
        this.playerFilter = new PlayerFilterViewModel();
        this.filteredPlayers = [];
        this.pageSize = game.config.search.pageSize;
        this.playerOrder = new PlayerOrderViewModel('-overall');
        this.selectedPlayer = null;
    }

    canBuy() {
        return this.selectedPlayer?.forSale && this.canMakeOffer;
    }

    canMakeOffer() {
        return this.selectedPlayer?.club.id === this.game.club.id;
    }

    getCountries() {
        const countries = this.game.countries
            .map(c => ({ id: c.id, name: this.translator.get(c.name) }))
            .orderBy('name');
        return countries;
    }

    getShowingPlayers() {
        const players = this.filteredPlayers
            .take(this.pageSize)
            .orderBy(this.playerOrder.orderColumn, '-overall', 'name');

        return players;
    }

    getShowingPlayersMessage() {
        const showing = this.filteredPlayers.length < this.pageSize ? this.filteredPlayers.length : this.pageSize;
        const total = this.filteredPlayers.length;
        const message = this.translator.get('Showing {0} of {1}').format(showing.toLocaleString(), total.toLocaleString());
        return message;
    }

    searchPlayers() {
        let players = Context.game.players;
        const filter = this.playerFilter;

        if (filter.name) {
            const name = filter.name.trim().toLowerCase().removeAccents();
            players = this.game.players.filter(p => p.name.toLowerCase().removeAccents().includes(name));
        }

        players = players.filter(p => p.age >= filter.age.minimum && p.age <= this.playerFilter.age.maximum);
        players = players.filter(p => p.overall >= filter.overall.minimum && p.overall <= this.playerFilter.overall.maximum);

        if (filter.countryId)
            players = players.filter(p => p.country.id === filter.countryId);

        if (filter.fieldRegionId)
            players = players.filter(p => p.position.fieldRegion.id === filter.fieldRegionId);

        if (filter.positionId)
            players = players.filter(p => p.position.id === filter.positionId);

        players = players.filter(p => p.marketValue <= filter.marketValue.currentValue * filter.marketValue.unit);
        if (filter.forSale)
            players = players.filter(p => p.forSale === true);

        players = players.orderBy('-overall', 'name');
        this.filteredPlayers = players;
    }

    resetFilter() {
        this.playerFilter.reset();
        this.filteredPlayers = [];
    }

    selectPlayer(player) {
        this.selectedPlayer = player;
    }
}