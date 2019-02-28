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
 * If an rdfs:label is present, that label is used. Otherwise
 * the last part of the id is returned
 *
 * @param entity    Expanded JSON-LD entity
 * @shortenExternalUris Shorten external URIs
 * @returns string
 */
export function getLabel(entity, shortenExternalUris = false) {
    if (
        Array.isArray(entity[LABEL_URI])
        && entity[LABEL_URI].length > 0
        && entity[LABEL_URI][0]['@value']
    ) {
        return entity[LABEL_URI][0]['@value'];
    }
    const id = entity['@id'];
    return id && linkLabel(id, shortenExternalUris);
}

/**
 * Returns a navigable link for a given metadata url
 *
 * If the url refers to an entity within our workspace, a special
 * url is constructed to show the page in the frontend.
 * Otherwise, the url is just returned as is
 *
 * @param link          The uri to make navigable
 * @returns string      The navigable URI
 */
export function navigableLink(link) {
    return link.startsWith(`${window.location.origin}/iri/collections/`)
        ? link.replace('/iri/collections/', '/collections/')
        : link;
}

/**
 * Returns a relative navigable link, excluding the base url
 * @param link
 * @returns {string}
 */
export function relativeLink(link) {
    return link.substring(window.location.origin.length);
}

export function isDateTimeProperty(property) {
    return property.range === 'http://www.w3.org/TR/xmlschema11-2/#dateTime';
}

export function generateUuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,
        // eslint-disable-next-line
        c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
}

export function getValues(entity, property) {
    return (entity[property] || []).map(v => v['@value'] || v['@id']);
}

export function getSingleValue(entity, property) {
    const values = getValues(entity, property);
    return (values.length > 0) ? values[0] : undefined;
}

export function shouldBeHidden(propertyURI, domainURI) {
    const isCollection = domainURI === COLLECTION_URI;
    const isFile = domainURI === FILE_URI;
    const isDirectory = domainURI === DIRECTORY_URI;
    const isManaged = isCollection || isFile || isDirectory;

    switch (propertyURI) {
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
}
