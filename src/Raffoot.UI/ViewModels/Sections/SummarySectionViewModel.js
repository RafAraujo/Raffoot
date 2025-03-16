class SummarySectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.selectedChampionship = null;
        this.selectedMatch = null;

        this.__watch = {
            currentMatch: this.watchCurrentMatch
        };
    }

    advanceDate() {
        this.game.club.setPlayersFieldLocalizations(this.game.club.playersFieldLocalizationsForLastMatch);
        this.game.advanceDate();
        Router.goTo('play');
    }

    getCurrentChampionshipEditions() {
        const championshipEditions = this.game.currentSeason
            .getCurrentChampionshipEditions()
            .filter(ce => ce.championship.id == this.selectedChampionship.id);

        return championshipEditions;
    }

    getChampionships() {
        const championships = this.game.currentSeason.
            getCurrentChampionshipEditions()
            .map(ce => ce.championship)
            .filter(c => c.division === 1)
            .map(c => ({ id: c.id, name: this.translator.getChampionshipName(c, false) }))
            .orderBy('-importance', 'name');
        
        return championships;
    }

    getCurrentChampionshipEditions() {
        let championshipEditions = this.game.currentSeason.getCurrentChampionshipEditions();

        if (this.selectedChampionship?.isNationalLeague)
            championshipEditions = championshipEditions.filter(ce => ce.championship.confederation.id === this.selectedChampionship.confederation.id);
        else
            championshipEditions = championshipEditions.filter(ce => ce.championship.id === this.selectedChampionship?.id);

        return championshipEditions;
    }

    getCurrentMatches(championshipEdition) {
        const matches = this.game.currentSeason.getCurrentMatchesByChampionshipEdition(championshipEdition);
        return matches;
    }

    getCurrentStageMessage(championshipEdition) {
        let message = '';
        const stage = this.game.currentSeason.getChampionshipEditionCurrentStage(championshipEdition);

        if (stage instanceof ChampionshipEditionFixture) {
            message = '{0} {1} - {2} {3}'.format(
                this.translator.get('Division'),
                championshipEdition.championship.division,
                this.translator.get('Matchday'),
                stage.number);
        }
        else if (stage instanceof ChampionshipEditionEliminationPhase) {
            message = this.translator.get(stage.name);
        }

        return message;
    }

    selectChampionship(id) {
        this.selectedChampionship = Championship.getById(parseInt(id));
    }

    selectMatch(id) {
        this.selectedMatch = Match.getById(parseInt(id));
    }

    showModal() {
        Router.get('modal-match').showModal(this.selectedMatch, this.selectedMatch.clubHome);
    }

    watchCurrentMatch(newValue) {
        this.selectedChampionship = newValue?.championshipEdition.championship ?? this._getDefaultChampionship();
    }

    _getDefaultChampionship() {
        const championshipEdition = this.game
            .currentSeason
            .getCurrentChampionshipEditions()
            .orderBy('-importance', '-clubs.length')[0];
        
        return championshipEdition;
    }
}