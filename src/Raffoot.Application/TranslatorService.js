class TranslatorService {
    constructor() {
        this.language = TranslatorService._getLanguage();
    }

    static _getAvailableLanguages() {
        return Object.getOwnPropertyNames(MultiLanguage);
    }

    static _getLanguage() {
        const availableLanguages = TranslatorService._getAvailableLanguages();
        const browserLanguage = navigator.language || navigator.userLanguage;
        const language = availableLanguages.find(l => browserLanguage.startsWith(l)) ?? 'en';
        return language;
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
            console.error(`Text "${text}" not found`)
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
}