class Club {
    constructor(name, countryId, externalId) {
        this.name = name;
        this._countryId = countryId;
        this.externalId = externalId;
        this._playerIds = [];
        this._squadId = null;

        this.backgroundColor = "";
        this.foregroundColor = "";
    }

    static create(name, countryName, externalId) {
        let country = Context.game.countries.find(c => c.name === countryName);
        let club = new Club(name, country.id, externalId);
        club.id = Context.game.clubs.push(club);
        
        country.addClub(club);

        let squad = Squad.create(club);
        club.squad = squad;
        
        return club;
    }

    static getById(id) {
        return Context.game.clubs[id - 1];
    }

    static getByName(name) {
        return Context.game.clubs.find(c => c.name === name);
    }

    get country() {
        return Country.getById(this._countryId);
    }

    get players() {
        return Context.game.players.filterByIds(this._playerIds);
    }

    get squad() {
        return Squad.getById(this._squadId);
    }

    set squad(value) {
        this._squadId = value.id;
    }

    get overall() {
        return this.squad.overall;
    }

    addPlayer(player) {
        this._playerIds.push(player.id);
    }

    getLogoURL() {
        return `${Config.folders.logosFolder}/${this.externalId}.png`;
    }

    getKitsURLs() {
        let urlList = [];
        for (let i = 1; i <= 4; i++) {
            let url = `${Config.folders.kitsFolder}/${this.externalId}/${i}.png`;
            urlList.push(url);
        }
        return urlList;
    }

    setColors(backgroundColor, foregroundColor) {
        this.backgroundColor = backgroundColor;
        this.foregroundColor = foregroundColor;
    }
}