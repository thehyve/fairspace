/**
 * Get collection from collection list by collection id
 * @param itemList
 * @param itemId
 */
export function findById(itemList, itemId) {
    return Array.isArray(itemList)
        ? itemList.find(item => item.hasOwnProperty('id') && item.id === itemId) : undefined;
}

/**
 * Joins an array with JSX entries together
 * @param array
 * @param str
 * @returns {Array}
 */
export const jsxJoin = (array, str) => {
    if (!array || array.length === 0) return [];

    let returnArray = [];
    Object.keys(array).forEach(idx => {
        if(idx > 0) {
            returnArray.push(str);
        }
        returnArray.push(array[idx])
    });

    return returnArray;
};

/**
 * Flattens the given array with a depth of 1
 * @param array
 * @returns {*}
 */
export const flattenShallow = array => array.reduce((acc, val) => acc.concat(val), []);
