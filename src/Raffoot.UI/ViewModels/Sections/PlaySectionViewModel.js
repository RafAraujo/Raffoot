class PlaySectionViewModel {
    static _callbacks = [];

    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
        
        this.selectedMatch = null;
        this.isLoading = false;
        this._dateHasChanged = false;

        const lineupOptions = {
            showAutomaticSelection: true,
            showUnlistedPlayers: true,
        };
        this.lineup = new TeamLineupViewModel(game, translator, false, lineupOptions);

        this.__watch = {
            currentMatch: this.watchCurrentMatch
        };

        addEventListener('moneychange', event => {
            PlaySectionViewModel._callbacks.push(this._animateMoney.bind(this, event.detail.previousValue, event.detail.value, 1000));
        });
    }

    __beforeUpdate() {
        if (this._dateHasChanged)
            this._animateDate();

        for (const callback of PlaySectionViewModel._callbacks) {
            callback();
            PlaySectionViewModel._callbacks.remove(callback);
        }

        this._dateHasChanged = false;
    }

    advanceDate() {
        this.isLoading = true;
        this._dateHasChanged = true;
        this.game.club.playersFieldLocalizationsForLastMatch = this.game.club.getPlayersFieldLocalizations();

        Vue.toRaw(this.game).play(1, () => {
            this.game.advanceDate();
        });
        this.isLoading = false;
    }

    getCurrentChampionshipName() {
        const championship = this.currentMatch.championshipEdition.championship;
        const name = this.translator.getChampionshipName(championship, false);
        return name;
    }

    getNationalLeaguePosition() {
        const nationalLeague = this.game.getNationalLeagueByClub(this.game.club);
        const position = this.game.getPositionInTheNationalLeagueByClub(this.game.club);
        const message = `${this.translator.getChampionshipName(nationalLeague.championship)} - ${this.translator.get("Position")} #${position}`;
        return message;
    }

    redirect(url) {
        location.href = url
    }

    simulateMatch() {
        Vue.toRaw(this.game).play(1, () => {
            Router.goTo('summary', true);
            Router.get('modal-match').showModal(this.currentMatch, this.game.club, 'statistics');
        });
    }

    startMatch() {
        if (!this.lineup.isValidLineup())
            return;

        Router.goTo('simulation');
        this.game.play(this.game.config.matchSpeed, () => setTimeout(() => {
            Router.get('modal-match').hideModal();
            Router.goTo('summary', true);
        }, Config.delayBeforeSummary));
    }

    watchCurrentMatch(newValue) {
        this.selectedMatch = newValue;
    }

    _animateDate() {
        const element = document.getElementById('current-date');
        element.classList.add('animate__animated', 'animate__backInRight');
        element.addEventListener('animationend', () => {
            element.classList.remove('animate__animated', 'animate__backInRight');
        });
    }

    _animateMoney(start, end, duration) {
        const obj = document.getElementById('club-money');
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            obj.innerText = Math.floor(progress * (end - start) + start).formatAbbreviated(this.translator.language);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }
}