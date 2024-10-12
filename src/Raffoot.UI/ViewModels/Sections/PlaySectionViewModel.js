class PlaySectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        this.gameService = new GameService();

        this.selectedClub = game.club;
        this.automaticSelection = true;
        this.selectedPlayerId = null;
    }

    get currentMatch() {
        return this.game.getCurrentMatch();
    }

    get currentOpponent() {
        return this.currentMatch?.getOpponent(this.game.club);
    }

    get selectedPlayer() {
        return Player.getById(this.selectedPlayerId);
    }

    async advanceDate() {
        if (this.game.currentSeason.currentSeasonDate.matches.length === 0) {
            this.game.advanceDate();
            await this.gameService.saveAsync(Vue.toRaw(this.game));
        }
        else {
            const url = `play.html?id=${this.game.id}`;
            this.redirect(url);
        }
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

    getCurrentMatch() {
        const match = this.game.getCurrentMatch();
        return match;
    }

    getCurrentOpponent() {
        const match = this.getCurrentMatch();
        const club = match.getOpponent(this.game.club);
        return club;
    }

    getBench() {
        return this.getLineup().filter(i => i.player.isOnBench).orderBy('player.order', 'player.position.id', '-player.overall');
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
        const lineup = this.selectedClub.getLineup(this.currentMatch?.championshipEdition);
        return lineup;
    }

    getNationalLeaguePosition() {
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

    redirect(url) {
        location.href = url
    }

    selectClub(club) {
        this.selectedClub = club;
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