class SummarySectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;

        this.selectedConfederation = this._getDefaultConfederation();
        this.selectedMatch = null;
    }

    advanceDate() {
        this.game.advanceDate();
        Router.goTo('play');
    }

    getCurrentChampionshipEditions() {
        const championshipEditions = this.game.currentSeason
            .getCurrentChampionshipEditions()
            .filter(ce => ce.championship.confederation.id == this.selectedConfederation.id);

        return championshipEditions;
    }

    getConfederations() {
        const confederations = this.game.currentSeason
            .getCurrentChampionshipEditions()
            .map(ce => ce.championship.confederation)
            .distinct()
            .map(c => ({ id: c.id, name: this.translator.get(c.name) }))
            .orderBy('name');

        return confederations;
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

    getCurrentMatches(championshipEdition) {
        const matches = this.game.currentSeason.getCurrentMatchesByChampionshipEdition(championshipEdition);
        return matches;
    }

    selectConfederation(id) {
        this.selectedConfederation = Confederation.getById(parseInt(id));
    }

    selectMatch(id) {
        this.selectedMatch = Match.getById(parseInt(id));
    }

    _getDefaultConfederation() {
        const countryId = this.game.club?.country.id;
        let confederation = this.game.confederations.find(conf => conf.countries.map(c => c.id).includes(countryId));
        return confederation;
    }

    getCurrentChampionshipEditions() {
        const clubConfederation = this.game.confederations.find(conf => conf.countries.map(c => c.id).includes(this.game.club?.country.id));
        let championshipEditions = this.game.currentSeason.getCurrentChampionshipEditions();
        
        let confederation = null;
        if (championshipEditions.flatMap(ce => ce.championship).some(c => c.confederation.id === clubConfederation.id)) {
            confederation = clubConfederation;
        }
        else {
            confederation = championshipEditions.flatMap(ce => ce.championship.confederation).distinct().getRandom();
        }
        
        championshipEditions = championshipEditions.filter(ce => ce.championship.confederation.id === confederation?.id);
        return championshipEditions;
    }
}