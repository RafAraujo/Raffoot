class MatchesSectionController {
    constructor(game, translator) {
        this.game = game;
        this.translator = translator;
    }

    getCurrentDateChampionshipEditions() {
        const clubConfederation = this.game.confederations.find(confederation => confederation.countries.map(c => c.id).includes(this.game.club.country.id));
        let championshipEditions = this.game.currentSeason.getCurrentDateChampionshipEditions();
        
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