class PlayerFilterViewModel {
    constructor() {
        this.reset();
    }

    reset() {
        this.name = '';
        this.countryId = null;
        this.fieldRegionId = null;
        this.positionId = null;
        this.age = {
            minimum: Config.player.minAge,
            maximum: Config.player.maxAge,
        };
        this.overall = {
            minimum: Config.player.minOverall,
            maximum: Config.player.maxOverall,
        };
        this.marketValue = {
            maximum: 350
        };
        this.forSale = false;
    }
}