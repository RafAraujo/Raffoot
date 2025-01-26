class GameFactory {
	static create(dataSource, year, name) {
		Context.game = new Game(dataSource, year, name);
		const service = new SeedService(dataSource, year);
		const isFantasyMode = Context.game.isFantasyMode;

		let t0 = performance.now();
		Continent.seed();
		console.log(`Continent.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		service.seedCountries();
		console.log(`service.seedCountries() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		Confederation.seed(isFantasyMode);
		console.log(`Confederation.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		FieldRegion.seed();
		console.log(`FieldRegion.seed() took ${(performance.now() - t0)} milliseconds.`);

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
		service.seedClubs();
		console.log(`service.seedClubs() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		ChampionshipType.seed();
		console.log(`ChampionshipType.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		Championship.seed(isFantasyMode);
		console.log(`Championship.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		GameFactory._definePromotionAndRelegation();
		console.log(`_definePromotionAndRelegation() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		GameFactory._arrangeSquads();
		console.log(`_arrangeSquads() took ${(performance.now() - t0)} milliseconds.`);;

		t0 = performance.now();
		Context.game.newSeason();
		console.log(`newSeason() took ${(performance.now() - t0)} milliseconds.`);

		return Context.game;
	}

	static _definePromotionAndRelegation() {
		const allNationalLeagues = Context.game.championships.filter(c => c.isNationalLeague);
		const confederations = Context.game.confederations.filter(c => c.isPlayable);

		for (const confederation of confederations) {
			const nationalLeagues = allNationalLeagues.filter(c => c.confederation.id === confederation.id);
			
			const clubsWithoutDivisionCount = confederation.clubs.length - nationalLeagues.flatMap(c => c.clubCount).sum();
			const lastDivision = nationalLeagues.length;
			
			let division = 1;
			while (division <= lastDivision) {
				const nationalLeague = nationalLeagues.find(c => c.division === division);
				nationalLeague.promotionClubCount = division === 1 ? 0 : nationalLeague.maxClubCountForPromotion;
				division++;
			}
			
			division = lastDivision;
			while (division >= 1) {
				const nationalLeague = nationalLeagues.find(c => c.division === division);
				const lowerDivision = nationalLeagues.find(c => c.division === division + 1);
				nationalLeague.relegationClubCount = division === lastDivision ? Math.min(clubsWithoutDivisionCount, nationalLeague.maxClubCountForRelegation) : lowerDivision.promotionClubCount;
				division--;
			}
		}
	}

	static _arrangeSquads() {
		const clubs = Context.game.clubs.filter(c => c.isPlayable);
		for (const club of clubs) {
			club.arrangePlayers();
			const playerWages = club.getPlayerWages();
			club.receive(playerWages * 18);
		}
	}
}