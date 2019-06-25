//* *********************************
//* ARRAYS
//* *********************************

/**
 * Get the first item that has an id that matches the given {itemId}
 * @param itemList
 * @param itemId
 */
export function findById(itemList, itemId) {
    return Array.isArray(itemList)
        ? itemList.find(item => item.id === itemId) : undefined;
}

/**
 * Flattens the given array with a depth of 1
 * @param array
 * @returns {*}
 */
export const flattenShallow = array => [].concat(...array);

/**
 * Adds a new entry to a given array, joining them with a separator.
 *
 * This method would typically be used to join an array of Jsx components into an array,
 * with some construct like this:
 *
 *   arrayWithComponents.reduce(jsxArrayJoiner(','), null)
 *
 * @param separator
 * @param prev
 * @param curr
 * @returns {*[]}
 */
export const jsxArrayJoiner = separator => (prev, curr) => (!prev ? curr : [...prev, separator, curr]);

//* *********************************
//* COMPARISION
//* *********************************

export function comparePrimitives(x, y) {
    if (x < y) {
        return -1;
    }
    if (x > y) {
        return 1;
    }
    return 0;
}

export function compareBy(valueExtractor, ascending = true) {
    const transform = (typeof valueExtractor === 'function') ? valueExtractor : x => x[valueExtractor];
    return (x, y) => (ascending ? 1 : -1) * comparePrimitives(transform(x), transform(y));
}

export function comparing(...comparators) {
    return comparators.reduce((c1, c2) => (x, y) => c1(x, y) || c2(x, y));
}

/**
 * Returns true if the given value is truthy or zero or false
 * @param value
 */
export const isNonEmptyValue = (value) => Boolean(value) || value === 0 || value === false;
