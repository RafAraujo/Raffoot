class PlayerFilterViewModel {
    constructor() {
        this.reset();
    }

    reset() {
        const player = Context.game.players.orderBy('-marketValue')[0];

        let unit = 1000;
        let step = 1;
        if (player.marketValue > 50 * 1000 * 1000)
            unit *= 1000;
        else
            step = 100;

        let stepCount = 1;
        let accumulator = 0;
        while (accumulator < player.marketValue / unit) {
            accumulator += step;
            stepCount++;
        }
        
        const maxMarketValue = step * stepCount;

        this.name = '';
        this.countryId = null;
        this.fieldRegionId = null;
        this.positionId = null;
        this.age = {
            minimum: Config.player.minAge,
            maximum: Config.player.maxAge,
        };
        this.overall = {
            minimum: Config.player.overall.min,
            maximum: Config.player.overall.max,
        };
        this.marketValue = {
            currentValue: maxMarketValue,
            unit: unit,
            maximum: maxMarketValue,
            step: step,
        };
        this.forSale = false;
    }
}