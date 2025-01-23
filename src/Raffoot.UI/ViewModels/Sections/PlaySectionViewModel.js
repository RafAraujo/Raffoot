class PlaySectionViewModel {
    static _callbacks = [];

    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        this.gameService = new GameService();

        this.selectedClub = game.club;
        this.automaticSelection = true;
        this.selectedPlayer = null;
        this.loading = false;
        this._dateHasChanged = false;

        addEventListener('moneychange', event => {
            PlaySectionViewModel._callbacks.push(this._animateMoney.bind(this, event.detail.previousValue, event.detail.value, 1000));
        });
    }

    async advanceDate() {
        this.loading = true;

        this._dateHasChanged = true;
        if (this.game.currentSeason.currentSeasonDate.matches.length === 0) {
            this.game.advanceDate();
            this.loading = false;
        }
        else {
            if (this.currentMatch) {
                Router.goTo('simulation');
                this.game.play(this.game.config.matchSpeed, () => setTimeout(() => {
                    Router.goTo('summary', true);
                    this.game.time = 0;
                    this.loading = false;
                }, Config.delayBeforeSummary));
            }
            else {
                this.game.play(1, () => {
                    this.game.advanceDate();
                    this.loading = false;
                });
            }
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
        console.info('playerid', playerId);
        event.dataTransfer.setData('playerId', playerId);
    }

    drop(event) {
        const data = event.dataTransfer.getData('playerId');
        const playerId = parseInt(data);
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

    getStyleForFieldLocalization(fieldLocalization) {
        const style = {
            top: (9 - fieldLocalization.line) * 9.2 + '%',
            left: fieldLocalization.column * 20 + '%'
        };
        return style;
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

    updated() {
        if (this._dateHasChanged)
            this._animateDate();

        for (const callback of PlaySectionViewModel._callbacks) {
            callback();
            PlaySectionViewModel._callbacks.remove(callback);
        }

        this._dateHasChanged = false;
    }

    _animateDate() {
        const element = document.querySelector('#current-date');
        element.classList.add('animate__animated', 'animate__backInRight');
        element.addEventListener('animationend', () => {
            element.classList.remove('animate__animated', 'animate__backInRight');
        });
    }

    _animateMoney(start, end, duration) {
        const obj = document.querySelector("#club-money");
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            obj.innerText = Math.floor(progress * (end - start) + start).formatAbbreviated();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }
}