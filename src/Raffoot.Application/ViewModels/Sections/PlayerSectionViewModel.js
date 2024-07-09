class PlayerSectionViewModel {
    constructor(game, translator) {
        this.controller = new PlayerSectionController(game, translator);
        this.playerFilter = new PlayerFilterViewModel();
        this.filteredPlayers = [];
        this.pageSize = game.config.search.pageSize;
        this.playerOrder = new PlayerOrderViewModel();
    }

    get showingPlayers() {
        const players = this.filteredPlayers
            .take(this.pageSize)
            .orderBy(this.playerOrder.orderColumn, '-overall', 'name');
        
        return players;
    }

    getCountries() {
        return this.controller.getCountries();
    }

    getShowingPlayersMessage() {
        return this.controller.getShowingPlayersMessage(this.filteredPlayers, this.pageSize);
    }

    searchPlayers() {
        this.filteredPlayers = this.controller.searchPlayers(this.playerFilter);
    }

    resetFilter() {
        this.playerFilter.reset();
        this.filteredPlayers = [];
    }
}