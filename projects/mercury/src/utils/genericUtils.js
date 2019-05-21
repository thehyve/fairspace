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
 * Getn an array and returns null if empty, single item if it's a single-item array otherwise return the array as it
 * @param {Array} value
 */
export const getFirstIfSingleItemArray = (value) => {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return null;
        } if (value.length === 1) {
            return value[0];
        }
    }

    return value;
};

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
