class StandingSectionViewModel {
    constructor(game, translator) {
        this.controller = new StandingSectionController(game, translator);
        this.activeTab = 'classification';
        this.isNationalChampionshipsSelected = true;
        this.selectedChampionshipEditionId = null;
    }

    get selectedChampionshipEdition() {
        const championshipEdition = Context.game.currentSeason.championshipEditions.find(ce => ce.id === this.selectedChampionshipEditionId);
        return championshipEdition;
    }

    getCssClassForPosition(position, championshipEdition) {
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

    selectNationalChampionships(currentMatch) {
        this.isNationalChampionshipsSelected = true;
        const nationalLeague = this.controller.getClubNationalLeague();
        this.selectedChampionshipEditionId = currentMatch?.championshipEdition.id ?? nationalLeague.id;
    }

    selectInternationalChampionships() {
        this.isNationalChampionshipsSelected = false;
        this.selectedChampionshipEditionId = null;
    }
}