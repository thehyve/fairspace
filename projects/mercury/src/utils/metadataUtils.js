import {
    COLLECTION_URI,
    COMMENT_URI,
    DATE_DELETED_URI,
    DELETED_BY_URI,
    DIRECTORY_URI,
    FILE_PATH_URI,
    FILE_URI,
    LABEL_URI,
    TYPE_URI
} from "../constants";


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

/**
 *
 * @param uri the URI to generate a label for
 * @param shortenExternalUris if true will generate a short label even if a URI doesn't belong to the current workspace
 * e.g. http://example.com/aaa/bbb => bbb
 * otherwise will leave external URIs unmodified
 * @returns {*}
 */
export function linkLabel(uri, shortenExternalUris = false) {
    const entityPrefix = `${window.location.origin}/iri/`;
    if (uri.startsWith(entityPrefix)) {
        const path = uri.substring(entityPrefix.length);
        return path.substring(path.indexOf('/') + 1);
    }

    const collectionPrefix = `${window.location.origin}/collections/`;
    if (uri.startsWith(collectionPrefix)) {
        return uri.substring(collectionPrefix.length);
    }

    if (shortenExternalUris) {
        return uri.includes('#')
            ? uri.substring(uri.lastIndexOf('#') + 1)
            : uri.substring(uri.lastIndexOf('/') + 1);
    }

    return uri;
}

/**
 * Returns the label for the given entity.
 *
 * If an rdfs:label is present, that label is used.
 * If an sh:name is present, that label is used
 * Otherwise the last part of the id is returned
 *
 * @param entity    Expanded JSON-LD entity
 * @param shortenExternalUris Shorten external URIs
 * @returns string
 */
export function getLabel(entity, shortenExternalUris = false) {
    return getFirstPredicateValue(entity, LABEL_URI)
        || getFirstPredicateValue(entity, 'http://www.w3.org/ns/shacl#name')
        || (entity && entity['@id'] && linkLabel(entity['@id'], shortenExternalUris));
}

/**
 * Returns a relative navigable link, excluding the base url
 * @param link
 * @returns {string}
 */
export function relativeLink(link) {
    const withoutSchema = link.toString().substring(link.toString().indexOf('//') + 2);
    return withoutSchema.substring(withoutSchema.indexOf('/'));
}

export function isDateTimeProperty(property) {
    return property.datatype === 'http://www.w3.org/TR/xmlschema11-2/#dateTime';
}

export function generateUuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,
        // eslint-disable-next-line
        c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
}

/**
 * Returns whether a property should be shown to the user
 * @param {string} key property key
 * @param {string} domain property domain
 */
export const shouldPropertyBeHidden = (key, domain) => {
    const isCollection = domain === COLLECTION_URI;
    const isFile = domain === FILE_URI;
    const isDirectory = domain === DIRECTORY_URI;
    const isManaged = isCollection || isFile || isDirectory;

    switch (key) {
        case '@type':
        case TYPE_URI:
        case FILE_PATH_URI:
        case DATE_DELETED_URI:
        case DELETED_BY_URI:
            return true;
        case LABEL_URI:
            return isManaged;
        case COMMENT_URI:
            return isCollection;
        default:
            return false;
    }
};

/**
 * Returns a filtered list of only properties to be shown to the user
 * @param {Object[]} properties the list of properties
 */
export const propertiesToShow = (properties = []) => {
    const domainKey = properties.find(property => property.key === '@type');
    const domainValue = domainKey && domainKey.values && domainKey.values[0] ? domainKey.values[0].id : undefined;

    return properties.filter(p => !shouldPropertyBeHidden(p.key, domainValue));
};

export const createIri = (id)  => `http://${window.location.hostname}/iri/${id}`;
