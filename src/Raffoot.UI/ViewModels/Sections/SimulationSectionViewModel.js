class SimulationSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getCurrentChampionshipName() {
        const championship = this.currentMatch.championshipEdition.championship;
        const name = this.translator.getChampionshipName(championship);
        return name;
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

    getCurrentChampionshipEditions() {
        const clubConfederation = this.game.confederations.find(conf => conf.countries.map(c => c.id).includes(this.game.club?.country.id));
        let championshipEditions = this.game.currentSeason.getCurrentChampionshipEditions();
        
        let confederation = null;
        if (championshipEditions.flatMap(ce => ce.championship).some(c => c.confederation.id === clubConfederation.id)) {
            confederation = clubConfederation;
        }
        else {
            confederation = Confederation.getByName('England');
        }
        
        championshipEditions = championshipEditions.filter(ce => ce.championship.confederation.id === confederation?.id);
        return championshipEditions;
    }
}