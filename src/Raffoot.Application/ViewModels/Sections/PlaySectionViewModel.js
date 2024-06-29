class PlaySectionViewModel {
    constructor(game, translator) {
        this.controller = new PlaySectionController(game, translator);
        this.automaticSelection = true;
        this.selectedPlayerId = null;
    }

    get selectedPlayer() {
        return this.controller.getPlayerById(this.selectedPlayerId);
    }

    changeFormation(formationId) {
        this.controller.changeFormation(formationId, this.automaticSelection);
    }

    unselectPlayer() {
        this.selectedPlayerId = null;
    }

    getBaseFormations() {
        return this.controller.getBaseFormations();
    }

    getFormations(baseFormation) {
        return this.controller.getFormations(baseFormation);
    }

    getClubNationalLeaguePositionMessage() {
        return this.controller.getClubNationalLeaguePositionMessage();
    }

    changePlayers(playerId) {
        playerId = parseInt(playerId);
        if (this.selectedPlayerId) {
            this.controller.swapPlayerRoles(this.selectedPlayerId, playerId);
            this.selectedPlayerId = null;
        }
        else {
            this.selectedPlayerId = playerId;
        }
    }

    dragStart(event, playerId) {
        event.dataTransfer.setData('playerId', playerId);
    }

    drop(event) {
        this.selectedPlayerId = parseInt(event.dataTransfer.getData('playerId'));
    }

    getInjuryMessage(player) {
        this.controller.getInjuryMessage(player);
    }

    movePlayerToBench() {
        this.controller.movePlayerToBench(this.selectedPlayerId);
        this.unselectPlayer();
    }

    movePlayerToField(fieldLocalizationId) {
        fieldLocalizationId = parseInt(fieldLocalizationId);
        if (this.selectedPlayerId) {
            this.controller.movePlayerToField(this.selectedPlayerId, fieldLocalizationId);
            this.selectedPlayerId = null;
        }
    }

}