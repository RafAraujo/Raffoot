class Club {
    constructor(name, countryId, externalId, backgroundColor, foregroundColor) {
        this.name = name;
        this._countryId = countryId;
        this.externalId = externalId;
        this.backgroundColorCustom = this.backgroundColor = backgroundColor;
        this.foregroundColorCustom = this.foregroundColor = foregroundColor;
        this._playerIds = [];
        this._squadId = null;
        this.money = 0;
        this._trophies = [];
    }

    static create(name, countryName, externalId, backgroundColor, foregroundColor) {
        const country = Context.game.countries.find(c => c.name === countryName);
        const club = new Club(name, country.id, externalId, backgroundColor, foregroundColor);
        club.id = Context.game.clubs.push(club);

        country.addClub(club);
        Squad.create(club);
        
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

    get overall() {
        return this.squad.overall;
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

    get throphies() {
        return Context.game.championshipEditions.filterByIds(this._trophies);
    }

    addPlayer(player) {
        this._playerIds.push(player.id);
    }

    addTrophy(championshipEdition) {
        this._trophies.push(championshipEdition.id);
    }

    getLogoURL() {
        return `${Config.folders.logosFolder}/${this.externalId}.png`;
    }

    getKitsURLs() {
        let urlList = [];
        for (let i = 1; i <= 3; i++) {
            let url = `${Config.folders.kitsFolder}/${this.externalId}/${i}.png`;
            urlList.push(url);
        }
        return urlList;
    }

    pay(amount) {
        this.money -= amount;
    }
    
    payWages() {
        this.pay(this.squad.wage);
    }

    receive(amount) {
        this.money += amount;
    }

    resetColors() {
        this.backgroundColorCustom = this.backgroundColor;
        this.foregroundColorCustom = this.foregroundColor;
    }
}