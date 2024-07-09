class Player {
    constructor(name, countryId, positionId, age, baseOverall, clubId, energy, externalId) {
        this.name = name;
        this._countryId = countryId;
        this._positionId = positionId;
        this.age = age;
        this.baseOverall = baseOverall;
        this._clubId = clubId;
        this.energy = energy;
        this.externalId = externalId;
    }

    static create(name, countryId, positionId, age, baseOverall, club, externalId) {
        const energy = 100;
        const player = new Player(name, countryId, positionId, age, baseOverall, club.id, energy, externalId);
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

    static getCategory(overall) {
        return overall >= 80 ? 'gold' : overall >= 60 ? 'silver' : 'bronze';
    }

    static _getBaseWage(overall) {
        return Math.max(Player._calculateBaseWage(overall), Player._getMinimumWage());
    }

    static _getMinimumWage() {
        return Player._calculateBaseWage(10, false);
    }

    static _calculateBaseWage(overall) {
        const wage = Math.pow(overall, 2.85);
        return Math.round(wage);
    }

    static _calculateMarketValue(overall, age) {
        const exponent = 3.1 + 0.01 * overall;
        const reference = Math.pow(overall, exponent);
        const factor = reference * 0.1;
        const multiplier = 32 - age;
        const value = reference + (factor * multiplier);
        return Math.round(value);
    }

    get category() {
        return Player.getCategory(this.baseOverall);
    }

    get fieldLocalization() {
        return this._fieldLocalizationId ? FieldLocalization.getById(this._fieldLocalizationId) : null;
    }

    set fieldLocalization(value) {
        if (value) {
            this._fieldLocalizationId = value.id;
        }
        else {
            delete this._fieldLocalizationId;
        }
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
        return this.isOnField ? this._positionId != this.fieldLocalization.position.id : false;
    }

    get isInjured() {
        return Object.hasOwn(this, 'injury');
    }

    get isOnBench() {
        return !this.fieldLocalization;
    }

    get isOnField() {
        return this.fieldLocalization ? true : false;
    }

    get marketValue() {
        return Player._calculateMarketValue(this.baseOverall, this.age);
    }

    get overall() {
        return this._fieldLocalizationId ? this.calculateOverallAt(this.fieldLocalization) : this.baseOverall;
    }

    get position() {
        return Position.getById(this._positionId);
    }

    get recoveryDate() {
        return this.isInjured ? this.injury.date.addDays(this.injury.daysToRecover) : null;
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

    get wage() {
        return Player._getBaseWage(this.baseOverall);
    }

    addChampionshipEditionPlayer(championshipEditionPlayer) {
        this._championshipEditionPlayers.push(championshipEditionPlayer.id);
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
        const file = `${this.externalId}.png` ?? '0.svg';
        const url = `${Config.folders.photosFolder}/${file}`;
        return url;
    }

    recover() {
        delete this.injury;
    }

    rest(days) {
        this.energy = Math.min(this.energy + days * 3, 100);
    }

    setInjury(date, daysToRecover) {
        this.injury = { date, daysToRecover };
    }
}