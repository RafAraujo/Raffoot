class TeamLineupViewModel {
    static _callbacks = [];

    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        this.gameService = new GameService();

        this.selectedClub = game.club;
        this.automaticSelection = true;
        this.selectedPlayer = null;
        this.substituteTypes = ['Bench', 'Unlisted players'];
    }

    changeFormation(formationId) {
        const formation = Formation.getById(formationId);
        this.game.club.changeFormation(formation, this.automaticSelection);
    }

    changePlayers(player) {
        if (player.club.id !== this.game.club.id)
            return;

        if (this.selectedPlayer) {
            this.game.club.swapPlayerRoles(this.selectedPlayer, player);
            this.selectedPlayer = null;
        }
        else {
            this.selectedPlayer = player;
        }
    }

    dragStart(event, playerId) {
        console.info('playerid', playerId);
        event.dataTransfer.setData('playerId', playerId);
    }

    drop(event) {
        const data = event.dataTransfer.getData('playerId');
        const playerId = parseInt(data);
        this.selectedPlayer = Player.getById(playerId);
    }

    getBaseFormations() {
        return this.game.formations.map(f => f.baseFormation).distinct().sort();
    }

    getEmptyFieldLocalizations() {
        return this.game.club.getEmptyFieldLocalizations();
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

    getPlayersOnField() {
        const players = this.selectedClub.playersOnField;
        const models = players.map(p => this._convertToPlayerModel(p, this.currentMatch?.championshipEdition));
        return models;
    }

    getPlayersOnBench() {
        const players = this.selectedClub.playersOnBench.orderBy('order', 'position.id', '-overall');
        const models = players.map(p => this._convertToPlayerModel(p, this.currentMatch?.championshipEdition));
        return models;
    }

    getNationalLeaguePosition() {
        const nationalLeague = this.game.getNationalLeagueByClub(this.game.club);
        const position = this.game.getPositionInTheNationalLeagueByClub(this.game.club);
        const message = `${this.translator.getChampionshipName(nationalLeague.championship)} - ${this.translator.get("Position")} #${position}`;
        return message;
    }

    getStyleForFieldLocalization(fieldLocalization) {
        const style = {
            top: (9 - fieldLocalization.line) * 9.2 + '%',
            left: fieldLocalization.column * 20 + '%'
        };
        return style;
    }

    getSubstitutePlayers(substituteType) {
        if (substituteType === 'Bench')
            return this.getPlayersOnBench();
        else if (substituteType === 'Unlisted players')
            return this.getUnlistedPlayers();
    }

    getUnlistedPlayers() {
        const players = this.selectedClub.unlistedPlayers.orderBy('order', 'position.id', '-overall');
        const models = players.map(p => this._convertToPlayerModel(p, this.currentMatch?.championshipEdition));
        return models;
    }

    loadDefaultPlayerPhoto(event) {
        Common.loadDefaultPlayerPhoto(event);
    }

    movePlayerTo(substituteType) {
        if (substituteType === 'Bench')
            this.movePlayerToBench();
        else if (substituteType === 'Unlisted players')
            this.movePlayerToUnlisted();
    }

    movePlayerToBench() {
        if (!this.selectedPlayer)
            return;

        if (!this.selectedPlayer.isOnBench && this.selectedClub.playersOnBench.length >= Config.match.benchSize) {
            const message = this.translator.get('The maximum number of players on the bench is {0}').format(Config.match.benchSize);
            Common.showToast(message, 'warning');
            this.unselectPlayer();
            return;
        }

        if (!this.selectedPlayer.isOnBench)
            this.game.club.movePlayerToBench(this.selectedPlayer);

        this.unselectPlayer();
    }

    movePlayerToField(fieldLocalizationId) {
        fieldLocalizationId = parseInt(fieldLocalizationId);
        if (this.selectedPlayer) {
            const fieldLocalization = FieldLocalization.getById(fieldLocalizationId);
            this.game.club.movePlayerToField(this.selectedPlayer, fieldLocalization);
            this.selectedPlayer = null;
        }
    }

    movePlayerToUnlisted() {
        if (this.selectedPlayer && !this.selectedPlayer.isUnlisted)
            this.game.club.movePlayerToUnlisted(this.selectedPlayer);

        this.unselectPlayer();
    }

    selectClub(club) {
        this.selectedClub = club;
    }

    unselectPlayer() {
        this.selectedPlayer = null;
    }

    _convertToPlayerModel(player, championshipEdition) {
        const model = {
            player: player,
            championshipEditionPlayer: championshipEdition?.championshipEditionPlayers.find(cep => cep.player.id === player.id),
            html: {
                player: {
                    class: [(player === this.selectedPlayer ? 'blink' : ''), (player.isInjured ? 'injured' : ''), (player.club.id === game.club.id ? 'my-club' : ''), (this.selectedPlayer ? 'selected-player' : '')],
                }
            }
        };

        return model;
    }
}