class GameFactory {
	static create(name, year = null) {
		if (year == null) {
			year = Config.defaultFirstYear;
		}

		Context.game = new Game(name, year);

		let t0 = performance.now();
		Continent.seed();
		console.log(`Continent.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		SoFifaService.seedCountries();
		console.log(`SoFifaService.seedCountries() took ${(performance.now() - t0)} milliseconds.`);
		
		t0 = performance.now();
		Confederation.seed();
		console.log(`Confederation.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		Position.seed();
		console.log(`Position.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		FieldLocalization.seed();
		console.log(`FieldLocalization.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		Formation.seed();
		console.log(`Formation.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		SoFifaService.seedClubs();
		console.log(`SoFifaService.seedClubs() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		ChampionshipType.seed();
		console.log(`ChampionshipType.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		Championship.seed();
		console.log(`Championship.seed() took ${(performance.now() - t0)} milliseconds.`);
		
		t0 = performance.now();
		for (let club of Context.game.clubs) {
			club.squad.arrange();
			club.receive(club.squad.wage * 9);
		}
        console.log(`Squad.arrange() took ${(performance.now() - t0)} milliseconds.`);;

		t0 = performance.now();
		Context.game.newSeason();
		console.log(`newSeason() took ${(performance.now() - t0)} milliseconds.`);
		
		return Context.game;
	}
}