class Player {
    constructor(fullName, name, countryId, positionIds, age, overall, clubId, externalId) {
        this.fullName = fullName;
        this.name = name;
        this._countryId = countryId;
        this._positionIds = positionIds;
        this.age = age;
        this._overall = overall;
        this._clubId = clubId;
        this.externalId = externalId;
        this.energy = 100;
        this.goals = 0;
    }

    static create(fullName, name, countryName, positionAbbreviations, age, overall, club, externalId) {
        let country = Context.game.countries.find(c => c.name === countryName);
        let positionIds = positionAbbreviations.map(pa => Context.game.positions.find(p => p.abbreviation === pa).id);
        let player = new Player(fullName, name, country.id, positionIds, age, overall, club.id, externalId);
        player.id = Context.game.players.push(player);
        club.addPlayer(player);
        SquadPlayer.create(club.squad, player);
        return player;
    }

    static getById(id) {
        return Context.game.players[id - 1];
    }

    static getByName(name) {
        return Context.game.players.find(p => p.name === name);
    }

    static getByFullName(fullName) {
        return Context.game.players.find(p => p.fullName === fullName);
    }

    static getCategory(overall) {
        return overall >= 80 ? 'gold' : overall >= 60 ? 'silver' : 'bronze';
    }

    get surname() {
        const array = this.name.split(' ');
        if (array.length > 1 && array[0].endsWith('.')) {
            array.shift();
            const name = array.join(' ');
            return name;
        }
        else {
            return this.name;
        }
    }

    get club() {
        return Club.getById(this._clubId);
    }

    get country() {
        return Country.getById(this._countryId);
    }

    get overall() {
        return this._overall;
    }

    get position() {
        return Position.getById(this._positionIds[0]);
    }

    get positions() {
        return Context.game.positions.filterByIds(this._positionIds);
    }

    get idealFieldLocalizations() {
        return this.position.fieldLocalizations;
    }

    get idealFormations() {
        return Context.game.formations.filter(f => f.fieldLocalizations)
    }

    getNearestFieldLocalization(fieldLocalization) {
        if (this.positions.includes(fieldLocalization.position))
            return fieldLocalization;
        
        let results = [];
        for (let idealFieldLocalization of this.idealFieldLocalizations) {
            results.push({
                fieldLocalization: idealFieldLocalization,
                distance: idealFieldLocalization.calculateDistanceTo(fieldLocalization)
            });
            
            return results.orderBy('distance')[0].fieldLocalization;
        }
    }

    getPhotoURL() {
        return `${Config.folders.photosFolder}/${this.externalId}.png`;
    }
}