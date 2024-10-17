class PlaySectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        this.gameService = new GameService();

        this.selectedClub = game.club;
        this.automaticSelection = true;
        this.selectedPlayer = null;
    }

    async advanceDate() {
        if (this.game.currentSeason.currentSeasonDate.matches.length === 0) {
            this.game.advanceDate();
        }
        else {
            Router.goTo('simulation');
            this.game.play(() => setTimeout(() => {
                Router.get('summary').$forceUpdate();
                Router.goTo('summary');
            }, Config.delayBeforeSummary));
        }
    }

    changeFormation(formationId) {
        const formation = Formation.getById(formationId);
        this.game.club.changeFormation(formation, this.automaticSelection);
    }

    changePlayers(player) {
        if (this.selectedPlayer) {
            this.game.club.swapPlayerRoles(this.selectedPlayer, player);
            this.selectedPlayer = null;
        }
        else {
            this.selectedPlayer = player;
        }
    }

    dragStart(event, playerId) {
        event.dataTransfer.setData('playerId', playerId);
    }

    drop(event) {
        const data = event.dataTransfer.getData('playerId');
        playerId = parseInt(data);
        this.selectedPlayer = Player.getById(playerId);
    }

    getCurrentChampionshipName() {
        const match = this.getCurrentMatch();
        const championship = match.championshipEdition.championship;
        const name = this.translator.getChampionshipName(championship, false);
        return name;
    }

    getCurrentMatch() {
        const match = this.game.getCurrentMatch();
        return match;
    }

    getCurrentOpponent() {
        const match = this.getCurrentMatch();
        const club = match?.getOpponent(this.game.club);
        return club;
    }

    getBench() {
        return this.getLineup().filter(i => i.player.isOnBench).orderBy('player.order', 'player.position.id', '-player.overall');
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

    loadDefaultPlayerPhoto = Common.loadDefaultPlayerPhoto;

    movePlayerToBench() {
        if (this.selectedPlayer?.fieldLocalization) {
            this.game.club.movePlayerToBench(this.selectedPlayer);
        }

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

    redirect(url) {
        location.href = url
    }

    selectClub(club) {
        this.selectedClub = club;
    }

    unselectPlayer() {
        this.selectedPlayer = null;
    }
}