class MatchesSectionViewModel {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getChampionshipEditionCurrentStageMessage(championshipEdition) {
        let message = '';
        const stage = this.game.currentSeason.getChampionshipEditionCurrentStage(championshipEdition);

        if (stage instanceof ChampionshipEditionFixture) {
            message = "{0} {1} - {2} {3}".format(
                this.translator.get("Division"),
                championshipEdition.championship.division,
                this.translator.get("Matchday"),
                stage.number);
        }
        else if (stage instanceof ChampionshipEditionEliminationPhase) {
            message = this.translator.get(stage.name);
        }

        return message;
    }

    getCurrentChampionshipEditions() {
        const clubConfederation = this.game.confederations.find(confederation => confederation.countries.map(c => c.id).includes(this.game.club.country.id));
        let championshipEditions = this.game.currentSeason.getCurrentChampionshipEditions();
        
        let confederation = null;
        if (championshipEditions.flatMap(ce => ce.championship).some(c => c.confederation.id === clubConfederation.id)) {
            confederation = clubConfederation;
        }
        else {
            confederation = this.game.confederations.find(c => c.name === 'England');
        }
        
        championshipEditions = championshipEditions.filter(ce => ce.championship.confederation.id === confederation.id);
        return championshipEditions;
    }
}