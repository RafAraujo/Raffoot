class Player {
    constructor(name, countryId, positionId, age, baseOverall, clubId, externalId, hasPhoto, energy, wage) {
        this.name = name;
        this._countryId = countryId;
        this._positionId = positionId;
        this.age = age;
        this.baseOverall = baseOverall;
        this._clubId = clubId;
        this._fieldLocalizationId = null;
        this.externalId = externalId;
        this.hasPhoto = hasPhoto;
        this.energy = energy;
        this.wage = wage;
        this.stats = { matches: 0, goals: 0, assists: 0 };
    }

    static create(name, countryId, positionId, age, baseOverall, club, externalId, hasPhoto) {
        const energy = 100;
        const wage = Player._getBaseWage(baseOverall, false);
        const player = new Player(name, countryId, positionId, age, baseOverall, club.id, externalId, hasPhoto, energy, wage);
        player.id = Context.game.players.push(player);
        
        club.addPlayer(player);
        
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
        return Math.max(Player._calculateBaseWage(overall, star), Player._getMinimumWage());
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
        return value;
    }

    get category() {
        return Player.getCategory(this.baseOverall);
    }

    get fieldLocalization() {
        return this._fieldLocalizationId ? FieldLocalization.getById(this._fieldLocalizationId) : null;
    }

    set fieldLocalization(value) {
        this._fieldLocalizationId = value ? value.id : null;
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

    get isImprovised() {
        if (this.fieldLocalization) {
            return this._positionId != this.fieldLocalization.position.id;
        }
        else {
            return false;
        }
    }
    
    get marketValue() {
        return Player._calculateMarketValue(this.baseOverall, this.star, this.age);
    }

    get overall() {
        return this._fieldLocalizationId ? this.calculateOverallAt(this.fieldLocalization) : this.baseOverall;
    }

    get position() {
        return Position.getById(this._positionId);
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

    calculateOverallAt(fieldLocalization) {
        if (this._positionId === fieldLocalization.position.id) {
            return this.baseOverall;
        }
        else if (this.position.fieldLocalizations[0].line === fieldLocalization.line) {
            const overall = this.baseOverall * 0.95;
            return Math.round(overall);
        }
        else {
            const playerNearestFieldLocalization = this.getNearestFieldLocalization(fieldLocalization);
            const distance = playerNearestFieldLocalization.calculateDistanceTo(fieldLocalization);
            const factor = playerNearestFieldLocalization.position.fieldRegion.id === fieldLocalization.position.fieldRegion.id ? 3 : 4;
            const overall = this.baseOverall - (distance * factor);
            return Math.round(overall);
        }
    }

    getNearestFieldLocalization(fieldLocalization) {
        if (this._positionId === fieldLocalization.position.id) {
            return fieldLocalization;
        }

        const results = [];
        for (const idealFieldLocalization of this.idealFieldLocalizations) {
            results.push({
                fieldLocalization: idealFieldLocalization,
                distance: idealFieldLocalization.calculateDistanceTo(fieldLocalization)
            });
        }

        return results.orderBy('distance')[0].fieldLocalization;
    }

    getPhotoURL() {
        const file = this.hasPhoto ? `${this.externalId}.png` : '0.svg';
        const url = `${Config.folders.photosFolder}/${file}`;
        return url;
    }

    rest(days) {
        this.energy = Math.min(this.energy + days * 3, 100);
    }
}