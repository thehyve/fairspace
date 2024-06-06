// @flow

/**
 * Returns the value of the given property on the first entry of the predicate for the metadat
 * @param metadataEntry     An expanded metadata object with keys being the predicates
 * @param predicate         The predicate to search for
 * @param property          The property to return for the found object. Mostly '@id' or '@value' are used
 * @param defaultValue      A default value to be returned if no value could be found for the metadata entry
 * @returns {*}
 */
export const getFirstPredicateProperty = (
    metadataEntry: any,
    predicate: string,
    property: string,
    defaultValue: any
): any =>
    // eslint-disable-next-line implicit-arrow-linebreak
    metadataEntry && metadataEntry[predicate] && metadataEntry[predicate][0]
        ? metadataEntry[predicate][0][property]
        : defaultValue;

export const getFirstPredicateValue = (metadataEntry: any, predicate: string, defaultValue: any): any =>
    getFirstPredicateProperty(metadataEntry, predicate, '@value', defaultValue);

export const getFirstPredicateId = (metadataEntry: any, predicate: string, defaultValue: any): any =>
    getFirstPredicateProperty(metadataEntry, predicate, '@id', defaultValue);

export const getFirstPredicateList = (metadataEntry: any, predicate: string, defaultValue: any): any =>
    getFirstPredicateProperty(metadataEntry, predicate, '@list', defaultValue);

/**
 * Normalize a JSON-LD resource by converting the values or iris into a single object
 *
 * The output of this method is comparable to the results provided by elasticsearch
 *
 * @example {'http://namespace#label': [{'@value': 'abc'}]} -> {http://namespace#label: ['abc']}
 * @param jsonLd
 * @returns {{}}
 */
export const normalizeJsonLdResource = (jsonLd: any): any =>
    Object.getOwnPropertyNames(jsonLd || {}).reduce((res: any, key: string) => {
        const values = jsonLd[key];
        res[key] = Array.isArray(values)
            ? values.map((v: any) => {
                  if (Object.prototype.hasOwnProperty.call(v, '@value')) return v['@value'];
                  return v['@id'] || v;
              })
            : values;
        return res;
    }, {});
