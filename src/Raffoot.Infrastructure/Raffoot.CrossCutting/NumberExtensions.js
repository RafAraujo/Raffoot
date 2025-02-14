const _currencyFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
    roundingIncrement: 5,
});

const _abbreviatedNumberFormatters = {}

Number.prototype.formatCurrency = function () {
    return _currencyFormatter.format(this);
}

Number.prototype.formatAbbreviated = function(language) {
    if (!_abbreviatedNumberFormatters[language])
        _abbreviatedNumberFormatters[language] = new Intl.NumberFormat(language, {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: this > 1000000 ? 1 : 0,
        });

    const formatter = _abbreviatedNumberFormatters[language];
    return formatter.format(this);
}

Number.prototype.formatInWords = function () {
    let formatted = '';
    let remainder = this;

    const numericClasses = [
        { value: Math.pow(1000, 4), name: 'trilion'},
        { value: Math.pow(1000, 3), name: 'billion'},
        { value: Math.pow(1000, 2), name: 'million'},
        { value: Math.pow(1000, 1), name: 'thousand'},
    ];

    for (const numericClass of numericClasses) {
        if (this >= numericClass.value) {
            let value = Math.trunc(remainder / numericClass.value);
            if (value === 0)
                continue;

            if (formatted.length > 0)
                formatted += ' ';

            formatted += `${value} ${numericClass.name}`
            remainder -= value * numericClass.value;
        }
    }

    return formatted;
}

Number.prototype.formatPercentage = function (minimumFractionDigits = 0) {
    return this.toLocaleString(undefined, { style: 'percent', minimumFractionDigits });
}