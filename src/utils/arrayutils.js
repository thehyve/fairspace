/**
 * Get collection from collection list by collection id
 * @param itemList
 * @param itemId
 */
export const findById = (itemList, itemId) => {
    if (itemList && Array.isArray(itemList)) {
        return itemList.find(item => {
            return item.hasOwnProperty('id') &&  item.id === itemId
        })
    }
};
