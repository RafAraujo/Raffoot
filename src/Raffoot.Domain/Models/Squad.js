class Squad {
    constructor(clubId) {
        this._clubId = clubId;
        this._formationId = null;
        this._squadPlayerIds = [];
    }

    static create(club) {
        let squad = new Squad(club.id);
        squad.id = Context.game.squads.push(squad);
        club.squad = squad;
        return squad;
    }

    static getById(id) {
        return Context.game.squads[id - 1];
    }

    get club() {
        return Club.getById(this._clubId);
    }

    get formation() {
        return Formation.getById(this._formationId);
    }

    set formation(value) {
        this._formationId = value.id;
    }

    get overall() {
        return this.starting11.map(sp => sp.overall).sum();
    }

    get squadPlayers() {
        return Context.game.squadPlayers.filterByIds(this._squadPlayerIds);
    }

    get players() {
        return this.squadPlayers.map(sp => sp.player);
    }

    get starting11() {
        return this.squadPlayers.filter(sp => sp.fieldLocalization).orderBy('id');
    }

    get substitutes() {
        return this.squadPlayers.filter(sp => !sp.fieldLocalization);
    }

    get wage() {
        return this.squadPlayers.map(sp => sp.player.wage).sum();
    }

    addSquadPlayer(squadPlayer) {
        this._squadPlayerIds.push(squadPlayer.id);
    }

    arrange() {
        let formation = this.getRecommendedFormation();
        this.changeFormation(formation);
    }

    getBestAvailableSquadPlayerForFieldLocalization(fieldLocalization) {
        let squadPlayers = this.substitutes.filter(sp => sp.player.positions.includes(fieldLocalization.position));
        return squadPlayers.length > 0 ? squadPlayers.orderBy('-ranking')[0] : null;
    }

    getBestAvailableSquadPlayersForPosition(position) {
        let squadPlayers = this.substitutes.filter(sp => sp.player.positions.includes(position));

        if (squadPlayers.length === 0)
            squadPlayers = this.substitutes.filter(sp => sp.player.positions.some(p => sp.fieldLocalization === null && p.fieldRegion === position.fieldRegion));
        
        if (squadPlayers.length === 0)
            squadPlayers = this.substitutes;
        
        return squadPlayers;
    }

    getRecommendedFormation() {
        let ranking = [];

        for (let formation of Context.game.formations) {
            let players = this.players.filter(pl => pl.positions.some(pos => formation.positions.includes(pos)));
            
            ranking.push({
                formation: formation,
                overall: players.map(p => p.overall).sum(),
            });
        }

        return ranking.orderBy('-overall')[0].formation;
    }

    changeFormation(formation) {
        this.formation = formation;
        this.setAutomaticLineUp();
    }

    setAutomaticLineUp() {
        this.squadPlayers.forEach(sp => sp.fieldLocalization = null);

        for (let fieldLocalization of this.formation.fieldLocalizations.reverse()) {
            let ranking = [];
            let chosenSquadPlayer = this.getBestAvailableSquadPlayerForFieldLocalization(fieldLocalization);

            if (chosenSquadPlayer === null) {
                let squadPlayers = this.getBestAvailableSquadPlayersForPosition(fieldLocalization.position);

                for (let squadPlayer of squadPlayers) {
                    let playerNearestFieldLocalization = squadPlayer.player.getNearestFieldLocalization(fieldLocalization);

                    ranking.push({
                        squadPlayer: squadPlayer,
                        overall: squadPlayer.calculateOverallAt(fieldLocalization),
                        distance: playerNearestFieldLocalization.calculateDistanceTo(fieldLocalization)
                    });
                }

                chosenSquadPlayer = ranking.orderBy('distance', '-overall', '-squadPlayer.player.energy')[0].squadPlayer;
            }

            chosenSquadPlayer.fieldLocalization = fieldLocalization;
        }
    }

    setSquadPlayerAtFieldLocalization(squadPlayer, fieldLocalization) {
        let currentSquadPlayer = this.starting11.find(sp => sp.fieldLocalization === fieldLocalization);
        if (currentSquadPlayer)
            this.swapRoles(currentSquadPlayer, squadPlayer);
        else
            squadPlayer.fieldLocalization = fieldLocalization;
    }

    swapRoles(squadPlayer1, squadPlayer2) {
        let aux = squadPlayer1.fieldLocalization;
        squadPlayer1.fieldLocalization = squadPlayer2.fieldLocalization;
        squadPlayer2.fieldLocalization = aux;
    }

    rest(days) {
        this.players.rest(days);
    }
}