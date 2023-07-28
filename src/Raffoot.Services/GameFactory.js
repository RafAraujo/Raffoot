class GameFactory {
	static create(name, year = null) {
		if (year == null) {
			year = Config.defaultFirstYear;
		}

		Context.game = new Game(name, year);
		
		let t0 = performance.now();
		SoFifaService.seedCountries();
		Position.seed();
		FieldLocalization.seed();
		Formation.seed();
		SoFifaService.seedClubs();
		ChampionshipType.seed();
		Championship.seed();
		console.log(`GameFactory.create() took ${(performance.now() - t0)} milliseconds.`);
		
		t0 = performance.now();
		for (let squad of Context.game.squads) {
			squad.arrange();
		}
        console.log(`Squad.arrange() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		Context.game.newSeason();
		console.log(`newSeason() took ${(performance.now() - t0)} milliseconds.`);

		ColorManager.setClubsColors();

		return Context.game;
	}
}