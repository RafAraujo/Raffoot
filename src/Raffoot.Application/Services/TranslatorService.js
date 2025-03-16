class TranslatorService {
    constructor() {
        this._browserLanguage = Config.browserLanguage;
        this._gameLanguage = null;

        this.language = this._getLanguage();
        document.documentElement.setAttribute('lang', this.language);
    }

    static _getAvailableLanguages() {
        return Object.getOwnPropertyNames(MultiLanguage);
    }

    setLanguage(language) {
        this._gameLanguage = language;
        this.language = this._getLanguage();
    }

    get(text) {
        if (this.language === 'en')
            return text;

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

        for (const word of array)
            if (word.length > 2)
                abbreviation += word[0].toUpperCase();

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
        const numericClasses = ["trilion", "billion", "million", "thousand"];
        const numericClassesPlural = ["trilions", "billions", "millions", "thousand"];

        const parts = text.split(' ');

        for (let i = 0; i < numericClasses.length; i++) {
            const numericClass = numericClasses[i];
            const numericClassPlural = numericClassesPlural[i];

            if (text.includes(numericClass)) {
                const index = parts.indexOf(numericClass);
                const number = parseInt(parts[index - 1]);
                const word = number === 1 ? numericClass : numericClassPlural;
                text = text.replace(numericClass, this.get(word));
            }
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