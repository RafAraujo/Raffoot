class TeamLineupViewModel {
    constructor(game, translator, matchInProgress, options = {}) {
        this.game = game;
        this.translator = translator;
        this.matchInProgress = matchInProgress;
        this.options = options;

        this.selectedClub = game.club;
        this.automaticSelection = true;
        this.selectedPlayer = null;

        this.substituteTypes = ['Bench'];
        if (this.options.showUnlistedPlayers)
            this.substituteTypes.push('Unlisted players');
    }

    changeFormation(formationId) {
        const formation = Formation.getById(formationId);
        this.game.club.changeFormation(formation, this.automaticSelection);
        this.game.club.reorderPlayers();
    }

    clickPlayer(player, match) {
        if (player.club.id !== this.game.club.id)
            return;

        if (this.selectedPlayer)
            this._changePlayers(this.selectedPlayer, player, match);
        else
            this.selectPlayer(player);
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
        return Formation.getBaseFormations().sort();
    }
    
    getClassForEnergy(player) {
        if (player.isInjured)
            return 'bg-danger';

        return player.energy > 75 ? 'bg-success' : player.energy > 50 ? 'bg-warning' : 'bg-danger';
    }

    getEmptyFieldLocalizations() {
        return this.selectedClub.getEmptyFieldLocalizations();
    }

    getFormations(baseFormation) {
        const formations = this.game.formations
            .filter(f => f.baseFormation === baseFormation)
            .map(f => ({ id: f.id, name: this.translator.getFormationName(f) }))
            .orderBy('name');

        return formations;
    }

    getPlayersOnField(match = null) {
        const players = this.selectedClub.playersOnField;
        const models = players.map(p => this._convertToPlayerModel(p, match));
        return models;
    }

    getNationalLeaguePosition() {
        const nationalLeague = this.game.getNationalLeagueByClub(this.game.club);
        const position = this.game.getPositionInTheNationalLeagueByClub(this.game.club);
        const message = `${this.translator.getChampionshipName(nationalLeague.championship)} - ${this.translator.get("Position")} #${position}`;
        return message;
    }

    getSize(substituteType) {
        switch (substituteType) {
            case 'Bench':
                return this.selectedClub.playersOnBench.length;
            case 'Unlisted players':
                return this.selectedClub.unlistedPlayers.length;
            default:
                return 0;
        }
    }

    getStyleForFieldLocalization(fieldLocalization) {
        const style = {
            top: (9 - fieldLocalization.line) * 9.2 + '%',
            left: fieldLocalization.column * 20 + '%'
        };
        return style;
    }

    getSubstitutePlayers(substituteType, match) {
        if (substituteType === 'Bench')
            return this._getPlayersOnBench(match);
        else if (substituteType === 'Unlisted players')
            return this._getUnlistedPlayers(match);
    }

    isValidLineup() {
        let error = null;

        const playersOnField = this.getPlayersOnField();

        if (playersOnField.length !== 11)
            error = 'The starting lineup must have 11 players';
        else if (playersOnField.some(i => i.player.isInjured))
            error = 'Please replace the injured players';
        else if (playersOnField.some(i => i.championshipEditionPlayer?.isSuspended))
            error = 'Please replace the suspended players';

        if (error)
            Common.showToast(this.translator.get(error), 'warning');

        return error === null;
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
            this.unselectPlayer();
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

    selectPlayer(player) {
        this.selectedPlayer = player;
    }

    unselectPlayer() {
        this.selectedPlayer = null;
    }

    _getPlayersOnBench(match = null) {
        const players = this.selectedClub.playersOnBench.orderBy('order', 'position.id', '-overall');
        const models = players.map(p => this._convertToPlayerModel(p, match));
        return models;
    }

    _getUnlistedPlayers(championshipEdition) {
        const players = this.selectedClub.unlistedPlayers.orderBy('order', 'position.id', '-overall');
        const models = players.map(p => this._convertToPlayerModel(p, championshipEdition));
        return models;
    }

    _changePlayers(player1, player2, match) {
        if (this.matchInProgress) {
            const playerFromField = [player1, player2].find(p => p.isOnField);
            const playerFromBench = [player1, player2].find(p => p.isOnBench);
            const substitutionsLeft = match.getPlayerSubstitutionsLeft(this.game.club);

            if (playerFromField && playerFromBench) {
                if (substitutionsLeft === 0) {
                    const message = this.translator.get('Substitution limit reached');
                    Common.showToast(message, 'warning');
                    this.unselectPlayer();
                    return;
                }

                match.makePlayerSubstitution(this.game.time, this.game.club, playerFromField, playerFromBench);
            }
        }
        else {
            this.game.club.swapPlayerRoles(player1, player2);
        }

        this.unselectPlayer();
    }

    _convertToPlayerModel(player, match) {
        const classes = [];
        if (player === this.selectedPlayer)
            classes.push('blink');
        if (player.isInjured)
            classes.push('injured');
        if (player.club.id === this.game.club.id)
            classes.push('my-club');
        if (this.selectedPlayer)
            classes.push('any-selected-player');

        const model = {
            player: player,
            championshipEditionPlayer: match?.championshipEdition?.championshipEditionPlayers.find(cep => cep.player.id === player.id),
            html: {
                player: {
                    class: classes,
                }
            }
        };
        
        return model;
    }
}