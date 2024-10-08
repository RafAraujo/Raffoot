class TranslatorService {
    constructor() {
        this._browserLanguage = Config.browserLanguage;
        this._gameLanguage = null;

        this.language = this._getLanguage();
    }

    static _getAvailableLanguages() {
        return Object.getOwnPropertyNames(MultiLanguage);
    }

    setLanguage(language) {
        this._gameLanguage = language;
        this.language = this._getLanguage();
    }

    get(text) {
        if (this.language === 'en') {
            return text;
        }

        const translations = MultiLanguage[this.language];
        const translation = translations[text] ?? translations[text.withOnlyFirstLetterUpperCase()];
        if (translation) {
            return translation;
        }
        else {
            console.error(`Text "${text}" not found`);
            return text;
        }
    } 

    getAbbreviation(text) {
        let abbreviation = '';
        const translation = this.get(text);
        const array = translation.split(' ');

        for (const word of array) {
            if (word.length > 2) {
                abbreviation += word[0].toUpperCase();
            }
        }

        return abbreviation;
    }

    getFormationName(formation) {
        let name = formation?.name ?? '';

        const description = formation.name.split(' ').slice(1).join(' ');
        if (description) {
            const descriptionTranslation = this.get(description);
            name = name.replace(description, descriptionTranslation);
        }

        return name;
    }

    getChampionshipName(championship, includeDivision = true) {
        const championshipNameWithoutDivision = championship.name.replace(` ${championship.division}`, '');
        const translation = this.get(championshipNameWithoutDivision);
        return championship.championshipType.format === 'league' && includeDivision ? `${translation} ${championship.division}` : `${translation}`;
    }

    getNumberInWords(text) {
        const numericClasses = ["billion", "million", "thousand"];

        for (const numericClass of numericClasses) {
            text = text.replace(numericClass, this.get(numericClass));
        }

        return text.toLowerCase();
    }

    _getLanguage() {
        const availableLanguages = TranslatorService._getAvailableLanguages();
        let language = this._gameLanguage ?? this._browserLanguage;
        language = availableLanguages.find(l => language.startsWith(l)) ?? 'en';
        return language;
    }
}