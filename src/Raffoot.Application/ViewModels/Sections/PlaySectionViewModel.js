class PlaySectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.automaticSelection = true;
        this.selectedPlayerId = null;
    }

    get selectedPlayer() {
        return Player.getById(this.selectedPlayerId);
    }

    changeFormation(formationId) {
        const formation = Formation.getById(formationId);
        this.game.club.changeFormation(formation, this.automaticSelection);
    }

    changePlayers(playerId) {
        playerId = parseInt(playerId);
        if (this.selectedPlayerId) {
            const player = Player.getById(playerId);
            this.game.club.swapPlayerRoles(this.selectedPlayer, player);
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
        const data = event.dataTransfer.getData('playerId');
        this.selectedPlayerId = parseInt(data);
    }

    getBaseFormations() {
        return this.game.formations.map(f => f.baseFormation).distinct().sort();
    }

    getFormations(baseFormation) {
        const formations = this.game.formations
            .filter(f => f.baseFormation === baseFormation)
            .map(f => ({ id: f.id, name: this.translator.getFormationName(f) }))
            .orderBy('name');

        return formations;
    }

    getInjuryMessage(player) {
        const message = '{0} - {1} {2}'.format(this.translator.get('Injured player'), this.translator.get('Out until'), player.recoveryDate.toLocaleDateString());
        return message;
    }

    getLineup() {
        const lineup = this.game.club.getLineup(this.currentMatch?.championshipEdition);
        return lineup;
    }

    getNationalLeaguePositionMessage() {
        const nationalLeague = this.game.getNationalLeagueByClub(this.game.club);
        const position = this.game.getPositionInTheNationalLeagueByClub(this.game.club);
        const message = `${this.translator.getChampionshipName(nationalLeague.championship)} - ${this.translator.get("Position")} #${position}`;
        return message;
    }

    movePlayerToBench(playerId) {
        const player = Player.getById(playerId);
        if (player?.fieldLocalization) {
            this.game.club.movePlayerToBench(player);
        }
        else {
            this.unselectPlayer();
        }
    }

    movePlayerToField(fieldLocalizationId) {
        fieldLocalizationId = parseInt(fieldLocalizationId);
        if (this.selectedPlayerId) {
            const player = Player.getById(this.selectedPlayerId);
            const fieldLocalization = FieldLocalization.getById(fieldLocalizationId);
            this.game.club.movePlayerToField(player, fieldLocalization);
            this.selectedPlayerId = null;
        }
    }

    swapPlayerRoles(playerId1, playerId2) {
        const player1 = Player.getById(playerId1);
        const player2 = Player.getById(playerId2);
        this.game.club.swapPlayerRoles(player1, player2);
    }

    unselectPlayer() {
        this.selectedPlayerId = null;
    }

}