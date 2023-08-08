class Player {
    constructor(fullName, name, countryId, positionIds, age, overall, clubId, externalId, wage) {
        this.fullName = fullName;
        this.name = name;
        this._countryId = countryId;
        this._positionIds = positionIds;
        this.age = age;
        this.overall = overall;
        this._clubId = clubId;
        this.externalId = externalId;
        this.energy = 100;
        this.star = false;
        this.wage = wage;
        this.goals = 0;
    }

    static create(fullName, name, countryName, positionAbbreviations, age, overall, club, externalId) {
        const country = Context.game.countries.find(c => c.name === countryName);
        const positionIds = positionAbbreviations.map(pa => Context.game.positions.find(p => p.abbreviation === pa).id);
        const marketValue = this._calculateBaseWage(overall, false);
        const wage = this._getBaseWage(overall, false);
        const player = new Player(fullName, name, country.id, positionIds, age, overall, club.id, externalId, wage);
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

    static _getBaseWage(overall, star) {
        return Math.max(this._calculateBaseWage(overall, star), this._getMinimumWage());
    }

    static _getMinimumWage() {
        return Player._calculateBaseWage(10, false);
    }

    static _calculateBaseWage(overall, star) {
        let factor = 2.125;
        let value = Math.pow(overall, factor);
        value *= star ? 2 : 1;
        return parseFloat(value.toFixed(2));
    }

    static _calculateMarketValue(overall, star, age) {
        let reference = Player._calculateBaseWage(overall, star) * 36;
        let multiplier = 32 - age;
        let factor = 0.05;
        let value = reference + (multiplier * factor * reference);
        return parseFloat(value.toFixed(2));
    }

    get category() {
        return Player.getCategory(this.overall);
    }

    get club() {
        return Club.getById(this._clubId);
    }

    get country() {
        return Country.getById(this._countryId);
    }

    get idealFieldLocalizations() {
        return this.position.fieldLocalizations;
    }

    get idealFormations() {
        return Context.game.formations.filter(f => f.fieldLocalizations)
    }
    
    get marketValue() {
        return Player._calculateMarketValue(this.overall, this.star, this.age);
    }

    get position() {
        return Position.getById(this._positionIds[0]);
    }

    get positions() {
        return [this.position];
        //return Context.game.positions.filterByIds(this._positionIds);
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

    getNearestFieldLocalization(fieldLocalization) {
        if (this.positions.includes(fieldLocalization.position))
            return fieldLocalization;
        
        const results = [];
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