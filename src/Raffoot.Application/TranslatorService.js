class TranslatorService {
    constructor() {
        this.language = TranslatorService.getLanguage();
    }

    static getAvailableLanguages() {
        return Object.getOwnPropertyNames(MultiLanguage);
    }

    static getLanguage() {
        const availableLanguages = TranslatorService.getAvailableLanguages();
        const browserLanguage = navigator.language || navigator.userLanguage;
        const language = availableLanguages.find(l => browserLanguage.startsWith(l)) ?? "en";
        return language;
    }

    get translations() {
        return MultiLanguage[this.language];
    }

    get(text) {
        if (this.language === "en") {
            const firstLanguageAvailable = Object.keys(MultiLanguage)[0];
            const translations = MultiLanguage[firstLanguageAvailable];
            if (!translations.hasOwnProperty(text) && !translations.hasOwnProperty(text.withOnlyFirstLetterUpperCase())) {
                console.error(`Text "${text}" not found`)
            }
            return text;
        }

        const translation = this.translations[text] ?? this.translations[text.withOnlyFirstLetterUpperCase()];
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
}