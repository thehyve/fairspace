export function comparePrimitives(x, y) {
    return (x < y) ? -1 : (x > y) ? 1 : 0
}

export function compareBy(valueExtractor, ascending = true) {
    const transform = (typeof valueExtractor === 'function') ? valueExtractor : x => x[valueExtractor];
    return (x, y) => (ascending ? 1 : -1) * comparePrimitives(transform(x), transform(y))
}

export function comparing(...comparators) {
    return comparators.reduce((c1, c2) => (x, y) => c1(x, y) || c2(x, y))
}
