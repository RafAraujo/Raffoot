const _currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
    roundingIncrement: 5,
});

Number.prototype.formatCurrency = function () {
    return _currencyFormatter.format(this);
}

Number.prototype.isEven = function() {
    return this % 2 == 0;
}

Number.prototype.isOdd = function() {
    return this % 2 == 1;
}