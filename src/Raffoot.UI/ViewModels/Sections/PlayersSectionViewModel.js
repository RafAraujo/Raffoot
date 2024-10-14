class PlayersSectionViewModel {
    constructor(game, translator, playerModal) {
        this.game = game;
        this.translator = translator;
        this.playerModal = playerModal;

        this.config = Config;
        this.playerFilter = new PlayerFilterViewModel();
        this.filteredPlayers = [];
        this.pageSize = game.config.search.pageSize;
        this.playerOrder = new PlayerOrderViewModel('-overall');
        this.selectedPlayer = null;
    }

    get canBuy() {
        return this.selectedPlayer?.forSale && this.canMakeOffer;
    }

    get canMakeOffer() {
        return this.selectedPlayer?.club.id === this.game.club.id;
    }

    get showingPlayers() {
        const players = this.filteredPlayers
            .take(this.pageSize)
            .orderBy(this.playerOrder.orderColumn, '-overall', 'name');

        return players;
    }

    getCountries() {
        const countries = this.game.countries
            .map(c => ({ id: c.id, name: this.translator.get(c.name) }))
            .orderBy('name');
        return countries;
    }

    getShowingPlayersMessage() {
        const showing = this.filteredPlayers.length < this.pageSize ? this.filteredPlayers.length : this.pageSize;
        const total = this.filteredPlayers.length;
        const message = this.translator.get('Showing {0} of {1}').format(showing.toLocaleString(), total.toLocaleString());
        return message;
    }

    searchPlayers() {
        let players = Context.game.players;
        const playerFilter = this.playerFilter;

        if (playerFilter.name) {
            const name = playerFilter.name.trim().toLowerCase().removeAccents();
            players = this.game.players.filter(p => p.name.toLowerCase().removeAccents().includes(name));
        }

        players = players.filter(p => p.age >= playerFilter.age.minimum && p.age <= this.playerFilter.age.maximum);
        players = players.filter(p => p.overall >= playerFilter.overall.minimum && p.overall <= this.playerFilter.overall.maximum);

        if (playerFilter.countryId) {
            players = players.filter(p => p.country.id === playerFilter.countryId);
        }

        if (playerFilter.fieldRegionId) {
            players = players.filter(p => p.position.fieldRegion.id === playerFilter.fieldRegionId);
        }

        if (playerFilter.positionId) {
            players = players.filter(p => p.position.id === playerFilter.positionId);
        }

        playerFilter.marketValue.maximum = window['market-value'].value;
        players = players.filter(p => p.marketValue <= playerFilter.marketValue.maximum * 1000 * 1000);
        if (playerFilter.forSale) {
            players = players.filter(p => p.forSale === true);
        }

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