class Squad {
    constructor(clubId) {
        this._clubId = clubId;
        this._formationId = null;
        this._squadPlayerIds = [];
    }

    static create(club) {
        const squad = new Squad(club.id);
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
        this._formationId = value?.id;
    }

    get overall() {
        return this.starting11.map(sp => sp.overall).sum();
    }

    get lineup() {
        return this._formationId ? this.formation.fieldLocalizations.map(fl => ({ fieldLocalization: fl, squadPlayer: this.getSquadPlayerByFieldLocalizationId(fl.id) })) : null;
    }

    get squadPlayers() {
        return Context.game.squadPlayers.filterByIds(this._squadPlayerIds);
    }

    get players() {
        return this.squadPlayers.map(sp => sp.player);
    }

    get starting11() {
        return this.squadPlayers.filter(sp => sp.fieldLocalization);
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

    add(player) {
        SquadPlayer.create(this, player);
    }

    remove(player) {
        const squadPlayer = this.squadPlayers.find(sp => sp.player.id === player.id);
        this._squadPlayerIds.remove(squadPlayer.id);
    }

    arrange() {
        const formation = this.getRecommendedFormation();
        this.changeFormation(formation, true);
    }

    getSquadPlayerByFieldLocalizationId(fieldLocalizationId) {
        return this.starting11.find(sp => sp.fieldLocalization.id === fieldLocalizationId);
    }

    getBestAvailableSquadPlayerForFieldLocalization(fieldLocalization) {
        const squadPlayers = this.substitutes.filter(sp => sp.player.positions.includes(fieldLocalization.position));
        const squadPlayer = squadPlayers.length > 0 ? squadPlayers.orderBy('-player.overall')[0] : null;
        return squadPlayer;
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
        const ranking = [];

        for (let formation of Context.game.formations) {
            const players = this.players.filter(pl => pl.positions.some(pos => formation.positions.includes(pos)));
            
            ranking.push({
                formation: formation,
                overall: players.map(p => p.overall).sum(),
            });
        }

        return ranking.orderBy('-overall')[0].formation;
    }

    changeFormation(formation, automaticLineup = false) {
        this.clearFieldLocalizations();
        this.formation = formation;
        if (automaticLineup) {
            this.setAutomaticLineUp();
        }
    }

    clearFieldLocalizations() {
        for (let squadPlayer of this.squadPlayers) {
            squadPlayer.fieldLocalization = null;
        }
    }

    setAutomaticLineUp() {
        for (let fieldLocalization of this.formation.fieldLocalizations.reverse()) {
            const ranking = [];
            let chosenSquadPlayer = this.getBestAvailableSquadPlayerForFieldLocalization(fieldLocalization);

            if (chosenSquadPlayer === null) {
                let squadPlayers = this.getBestAvailableSquadPlayersForPosition(fieldLocalization.position);

                for (let squadPlayer of squadPlayers) {
                    const playerNearestFieldLocalization = squadPlayer.player.getNearestFieldLocalization(fieldLocalization);

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

    setOrder() {
        const squadPlayers = this.squadPlayers.orderBy('order', 'player.position.id', '-player.overall')
        let order = 0;
        for (let squadPlayer of squadPlayers) {
            squadPlayer.order = ++order;
        }
    }

    setSquadPlayerAtFieldLocalization(squadPlayer, fieldLocalization) {
        const currentSquadPlayer = this.starting11.find(sp => sp.fieldLocalization === fieldLocalization);
        if (currentSquadPlayer)
            this.swapRoles(currentSquadPlayer, squadPlayer);
        else
            squadPlayer.fieldLocalization = fieldLocalization;
    }

    swapRoles(squadPlayer1, squadPlayer2) {
        const aux = { fieldLocalization: squadPlayer1.fieldLocalization, order: squadPlayer1.order };

        squadPlayer1.fieldLocalization = squadPlayer2.fieldLocalization;
        squadPlayer2.fieldLocalization = aux.fieldLocalization;

        squadPlayer1.order = squadPlayer2.order;
        squadPlayer2.order = aux.order;
    }

    rest(days) {
        this.players.rest(days);
    }
}