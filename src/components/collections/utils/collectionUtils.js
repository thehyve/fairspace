/**
 * Get collection from collection list by collection id
 * @param collections
 * @param collectionId
 */
export const getCollectionById = (collections, collectionId) => {
    if (collections || collections.length !== 0) {
        return collections.find(collection => collection.id === collectionId)
    }
};
