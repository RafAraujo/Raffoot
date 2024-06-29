class PlaySectionController {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    changeFormation(formationId, automaticSelection) {
        const formation = Formation.getById(formationId);
        this.game.club.changeFormation(formation, automaticSelection);
    }

    getBaseFormations() {
        const formations = this.game.formations.map(f => f.baseFormation).distinct().sort();
        return formations;
    }

    getFormations(baseFormation) {
        const formations = this.game.formations
            .filter(f => f.baseFormation === baseFormation)
            .map(f => ({ id: f.id, name: this.translator.getFormationName(f) }))
            .orderBy('name');
        
        return formations;
    }

    getInjuryMessage(player) {
        const message = '{0} - {1}'.format(this.translator.get('Injured player'), this.translator.get('Out until {0}').format(player.recoveryDate.toLocaleDateString()));
        return message;
    }

    getClubNationalLeaguePositionMessage() {
        const nationalLeague = this.game.getClubNationalLeague();
        const position = nationalLeague.getClubPosition(this.game.club);
        const message = `${this.translator.getChampionshipName(nationalLeague.championship)} - ${this.translator.get("Position")} #${position}`;
        return message;
    }

    getPlayerById(playerId) {
        return Player.getById(playerId);
    }

    movePlayerToBench(playerId) {
        const player = Player.getById(playerId);
        if (player?.fieldLocalization) {
            this.game.club.movePlayerToBench(player);
        }
    }

    movePlayerToField(playerId, fieldLocalizationId) {
        const player = Player.getById(playerId);
        const fieldLocalization = FieldLocalization.getById(fieldLocalizationId);
        this.game.club.movePlayerToField(player, fieldLocalization);
    }

    swapPlayerRoles(playerId1, playerId2) {
        const player1 = Player.getById(playerId1);
        const player2 = Player.getById(playerId2);
        this.game.club.swapPlayerRoles(player1, player2);
    }
}