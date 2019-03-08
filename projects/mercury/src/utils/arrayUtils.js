/**
 * Get collection from collection list by collection id
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
