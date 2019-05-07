/**
 * Returns the value of the given property on the first entry of the predicate for the metadat
 * @param metadataEntry     An expanded metadata object with keys being the predicates
 * @param predicate         The predicate to search for
 * @param property          The property to return for the found object. Mostly '@id' or '@value' are used
 * @param defaultValue      A default value to be returned if no value could be found for the metadata entry
 * @returns {*}
 */
export const getFirstPredicateProperty = (metadataEntry, predicate, property, defaultValue) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    (metadataEntry && metadataEntry[predicate] && metadataEntry[predicate][0] ? metadataEntry[predicate][0][property] : defaultValue);

export const getFirstPredicateValue = (metadataEntry, predicate, defaultValue) => getFirstPredicateProperty(metadataEntry, predicate, '@value', defaultValue);

export const getFirstPredicateId = (metadataEntry, predicate, defaultValue) => getFirstPredicateProperty(metadataEntry, predicate, '@id', defaultValue);

export const getFirstPredicateList = (metadataEntry, predicate, defaultValue) => getFirstPredicateProperty(metadataEntry, predicate, '@list', defaultValue);
