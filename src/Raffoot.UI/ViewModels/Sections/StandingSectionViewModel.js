class StandingSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.activeTab = 'classification';
        this.isNationalChampionshipsSelected = true;
        this.selectedChampionshipEditionId = null;
    }

    get selectedChampionshipEdition() {
        const championshipEdition = Context.game.currentSeason.championshipEditions.find(ce => ce.id === this.selectedChampionshipEditionId);
        return championshipEdition;
    }

    getChampionshipEditionsByConfederation(confederationId) {
        const championshipEditions = this.game.currentSeason
            .getChampionshipEditionsByConfederation(confederationId)
            .map(ce => ({
                id: ce.id,
                importance: ce.championship.importance,
                name: this.translator.getChampionshipName(ce.championship)
            }))
            .orderBy('-importance', 'name');
        
        return championshipEditions;
    }

    getConfederations() {
        const confederations = this.game.confederations
            .map(c => ({ id: c.id, name: this.translator.get(c.name) }))
            .orderBy('name');
        
        return confederations;
    }

    getCssClassForPosition(position) {
        const championshipEdition = this.selectedChampionshipEdition;
        
        if (championshipEdition.getContinentalCupClassificationZonePositions(1).includes(position)) {
            return 'main-continental-cup';
        }
        else if (championshipEdition.getContinentalCupClassificationZonePositions(2).includes(position)) {
            return 'secondary-continental-cup';
        }
        else if (championshipEdition.getPromotionZonePositions().includes(position)) {
            return 'promotion';
        }
        else if (championshipEdition.getRelegationZonePositions().includes(position)) {
            return 'relegation';
        }
    }

    getInternationalChampionshipEditions() {
        const championshipEditions = this.game.currentSeason
            .getInternationalChampionshipEditions()
            .map(ce => ({
                id: ce.id,
                importance: ce.championship.importance,
                name: this.translator.getChampionshipName(ce.championship)
            }))
            .orderBy('-importance', 'name');
        
        return championshipEditions;
    }

    getLast5(championshipEdition, club) {
        const fixtures = this.game.getLastFixtures(championshipEdition, 5);
        const matches = fixtures.flatMap(f => f.matches).filter(m => m.clubs.includes(club)).filter(m => m.isFinished);
        const result = [];

        for (const match of matches) {
            const description = match.isDraw ? 'Draw' : match.getWinner() === club ? 'Win' : 'Loss';
            const item = {
                color: 'text-' + (description === 'Draw' ? 'secondary' : description === 'Win' ? 'success' : 'danger'),
                description: `${this.translator.get(description)} (${match.fullDescription})`,
                icon: 'fa-' + (description === 'Draw' ? 'circle-minus' : description === 'Win' ? 'circle-check' : 'circle-xmark'),
            };

            result.push(item);
        }

        return result;
    }

    selectNationalChampionship(currentMatch) {
        this.isNationalChampionshipsSelected = true;
        const nationalLeague = this.game.getNationalLeagueByClub(this.game.club);
        const currentChampionshipEdition = currentMatch?.championshipEdition;
        this.selectedChampionshipEditionId = currentChampionshipEdition?.id ?? nationalLeague.id;
    }

    selectInternationalChampionship() {
        this.isNationalChampionshipsSelected = false;
        this.selectedChampionshipEditionId = null;
    }
}