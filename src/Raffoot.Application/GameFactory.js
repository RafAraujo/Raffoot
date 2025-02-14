class GameFactory {
	static create(dataSource, year, name, combineCountries) {
		Context.game = new Game(dataSource, year, name);
		const service = new SeedService(dataSource, year);
		const isFantasyMode = Context.game.isFantasyMode;

		let t0 = performance.now();
		Continent.seed();
		console.log(`Continent.seed() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		service.seedCountries();
		console.log(`service.seedCountries() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		FieldRegion.seed();
		console.log(`FieldRegion.seed() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		Position.seed();
		console.log(`Position.seed() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		FieldLocalization.seed();
		console.log(`FieldLocalization.seed() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		Formation.seed();
		console.log(`Formation.seed() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		service.seedClubs();
		console.log(`service.seedClubs() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		isFantasyMode ? Confederation.seedForFantasyMode() : Confederation.seed(combineCountries);
		console.log(`Confederation.seed() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		ChampionshipType.seed();
		console.log(`ChampionshipType.seed() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		Championship.seed(isFantasyMode);
		console.log(`Championship.seed() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		Context.game.definePromotionAndRelegation();
		console.log(`game.definePromotionAndRelegation() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		Context.game.distributeContinentalSpots();
		console.log(`game.distributeContinentalSpots() took ${performance.now() - t0} milliseconds.`);

		t0 = performance.now();
		Context.game.arrangeSquads();
		console.log(`game.arrangeSquads() took ${performance.now() - t0} milliseconds.`);;

		t0 = performance.now();
		Context.game.newSeason();
		console.log(`newSeason() took ${performance.now() - t0} milliseconds.`);

		return Context.game;
	}
}