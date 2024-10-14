class StandingsSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.activeTab = 'classification';
        this.isNationalChampionshipsSelected = true;
        this.selectedChampionshipEditionId = null;
    }

    get selectedChampionshipEdition() {
        const championshipEdition = game.currentSeason.championshipEditions.find(ce => ce.id === this.selectedChampionshipEditionId);
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

    getLast5Results(championshipEditionClub) {
        const response = [];

        for (const matchInfo of championshipEditionClub.last5Results) {
            const result = matchInfo.result;

            const item = {
                color: 'text-' + (result === 'Draw' ? 'secondary' : result === 'Win' ? 'success' : 'danger'),
                description: `${this.translator.get(result)} - ${matchInfo.description}`,
                icon: 'fa-' + (result === 'Draw' ? 'circle-minus' : result === 'Win' ? 'circle-check' : 'circle-xmark'),
            };
            response.push(item);
        }

        return response;
    }

    getTable() {
        return this.selectedChampionshipEdition?.getTable()
    }

    getTopScorers() {
        const topScorers = this.selectedChampionshipEdition?.getTopScorers().take(20);
        return topScorers;
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