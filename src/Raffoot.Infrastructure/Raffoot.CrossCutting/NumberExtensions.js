const _currencyFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
    roundingIncrement: 5,
});

Number.prototype.formatCurrency = function () {
    return _currencyFormatter.format(this);
}

Number.prototype.formatNumberInWords = function () {
    const options = [
        { value: Math.pow(1000, 3), suffix: 'B', maximumFractionDigits: 1 },
        { value: Math.pow(1000, 2), suffix: 'M', maximumFractionDigits: 1 },
        { value: Math.pow(1000, 1), suffix: 'K', maximumFractionDigits: 0 },
    ];

    for (const option of options) {
        if (this > option.value) {
            let value = this / option.value;
            value = new Intl.NumberFormat(undefined, { maximumFractionDigits: option.maximumFractionDigits }).format(value);
            return `${value}${option.suffix}`;
        }
    }

    return this;
}

Number.prototype.formatPercentage = function (minimumFractionDigits = 0) {
    return this.toLocaleString(undefined, { style: 'percent', minimumFractionDigits });
}

Number.prototype.isEven = function () {
    return this % 2 == 0;
}

Number.prototype.isOdd = function () {
    return this % 2 == 1;
}