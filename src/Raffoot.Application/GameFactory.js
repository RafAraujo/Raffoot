class GameFactory {
	static create(dataSource, year, name, combineCountries) {
		Context.game = new Game(dataSource, year, name);
		const service = new SeedService(dataSource, year);
		const isFantasyMode = Context.game.isFantasyMode;

		let elapsedTime = 0;
		const limit = 5;

		let tTotal = performance.now();

		let t0 = performance.now();
		Continent.seed();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	Continent.seed() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		service.seedCountries();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	service.seedCountries() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		FieldRegion.seed();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	FieldRegion.seed() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		Position.seed();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	Position.seed() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		FieldLocalization.seed();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	FieldLocalization.seed() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		Formation.seed();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	Formation.seed() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		service.seedClubs();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	service.seedClubs() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		Context.game.distributeInitialMoneyForClubs();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	game.receiveInitialMoney() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		isFantasyMode ? Confederation.seedForFantasyMode() : Confederation.seed(combineCountries);
		console.log((elapsedTime = performance.now() - t0) > limit ? `	Confederation.seed() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		ChampionshipType.seed();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	ChampionshipType.seed() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		Championship.seed(isFantasyMode);
		console.log((elapsedTime = performance.now() - t0) > limit ? `	Championship.seed() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		Context.game.definePromotionAndRelegation();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	game.definePromotionAndRelegation() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		Context.game.distributeContinentalSlots();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	game.distributeContinentalSlots() took ${performance.now() - t0} milliseconds.` : '');

		t0 = performance.now();
		Context.game.newSeason();
		console.log((elapsedTime = performance.now() - t0) > limit ? `	game.newSeason() took ${performance.now() - t0} milliseconds.` : '');

		console.log(`GameFactory.create() took ${performance.now() - tTotal} milliseconds.`);
		console.log('');

		return Context.game;
	}
}