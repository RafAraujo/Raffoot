class GameFactory {
	static create(name, year = null) {
		if (year == null) {
			year = Config.years.default;
		}

		Context.game = new Game(name, year);
		const service = new FifaService(year);

		let t0 = performance.now();
		Continent.seed();
		console.log(`Continent.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		service.seedCountries();
		console.log(`SoFifaService.seedCountries() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		Confederation.seed();
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
		console.log(`SoFifaService.seedClubs() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		ChampionshipType.seed();
		console.log(`ChampionshipType.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		Championship.seed();
		console.log(`Championship.seed() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		GameFactory._definePromotionAndRelegation();
		console.log(`_definePromotionAndRelegation() took ${(performance.now() - t0)} milliseconds.`);

		t0 = performance.now();
		GameFactory._arrangeSquads(Context.game.clubs);
		console.log(`_arrangeSquads() took ${(performance.now() - t0)} milliseconds.`);;

		t0 = performance.now();
		Context.game.newSeason();
		console.log(`newSeason() took ${(performance.now() - t0)} milliseconds.`);

		return Context.game;
	}

	static _definePromotionAndRelegation() {
		const allNationalLeagues = Context.game.championships.filter(c => c.isNationalLeague);
		const confederations = Context.game.confederations.filter(c => c.playable);

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
		for (const club of Context.game.clubs) {
			club.arrangePlayers();
			club.receive(club.playerWages * 18);
		}
	}
}