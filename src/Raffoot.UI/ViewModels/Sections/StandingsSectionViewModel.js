class StandingsSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.activeTab = 'classification';
        this.isNationalChampionshipsSelected = true;
        this.selectedChampionshipEdition = null;
        this.topScorersViewModel = new TopScorersViewModel(game, translator);
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

    getClassForPosition(position) {
        const ce = this.selectedChampionshipEdition;
        
        if (ce.getContinentalCupClassificationZonePositions(1).includes(position)) return 'main-continental-cup';
        else if (ce.getContinentalCupClassificationZonePositions(2).includes(position)) return 'secondary-continental-cup';
        else if (ce.getPromotionZonePositions().includes(position)) return 'promotion';
        else if (ce.getRelegationZonePositions().includes(position)) return 'relegation';
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

    getLeagueTable() {
        const table = this.selectedChampionshipEdition?.getLeagueTable();
        return table;
    }

    getTopScorers() {
        const topScorers = this.topScorersViewModel.getTopScorers(this.selectedChampionshipEdition);
        return topScorers;
    }

    selectChampionshipEdition(id) {
        this.selectedChampionshipEdition = id ? ChampionshipEdition.getById(parseInt(id)) : null;
    }

    selectNationalChampionship(currentMatch) {
        this.isNationalChampionshipsSelected = true;
        const nationalLeague = this.game.getNationalLeagueByClub(this.game.club);
        const currentChampionshipEdition = currentMatch?.championshipEdition;
        this.selectedChampionshipEdition = currentChampionshipEdition ?? nationalLeague;
    }

    selectInternationalChampionship() {
        this.isNationalChampionshipsSelected = false;
        this.selectedChampionshipEdition = null;
    }
}