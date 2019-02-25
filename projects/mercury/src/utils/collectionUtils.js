export const getCollectionAbsolutePath = (col) => (col && col.location ? `/collections/${col.location}` : '');
