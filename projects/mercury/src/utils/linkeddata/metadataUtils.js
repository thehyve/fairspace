import _ from 'lodash';

import * as consts from "../../constants";
import {getFirstPredicateId, getFirstPredicateValue} from "./jsonLdUtils";

/**
 *
 * @param uri the URI to generate a label for
 * @param shortenExternalUris if true will generate a short label even if a URI doesn't belong to the current workspace
 * e.g. http://example.com/aaa/bbb => bbb
 * otherwise will leave external URIs unmodified
 * @returns {*}
 */
export function linkLabel(uri, shortenExternalUris = false) {
    const supportedLocalInfixes = ['/iri/', '/vocabulary/', '/collections/'];
    const url = new URL(uri);

    // Local uris are treated separately, as we know its
    // structure
    if (url.hostname === window.location.hostname) {
        const foundInfix = supportedLocalInfixes.find(infix => url.pathname.startsWith(infix));
        if (foundInfix) {
            return `${url.pathname.substring(foundInfix.length)}${url.search}${url.hash}`;
        }
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
    return getFirstPredicateValue(entity, consts.LABEL_URI)
        || getFirstPredicateValue(entity, consts.SHACL_NAME)
        || (entity && entity['@id'] && linkLabel(entity['@id'], shortenExternalUris));
}

/**
 * Looks up a label for the given entity in the provided metadata
 * @param id
 * @param allMetadata
 * @returns {string}
 */
export const lookupLabel = (id, allMetadata) => {
    const entry = allMetadata.find(element => element['@id'] === id);
    return getLabel(entry);
};

/**
 * Returns a relative navigable link, excluding the base url
 * @param link
 * @returns {string}
 */
export function relativeLink(link) {
    const withoutSchema = link.toString().substring(link.toString().indexOf('//') + 2);
    return withoutSchema.substring(withoutSchema.indexOf('/'));
}

export function generateUuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,
        // eslint-disable-next-line
        c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
}

export function isValidLinkedDataIdentifier(uri) {
    try {
        // eslint-disable-next-line no-new
        new URL(uri);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Returns whether a property should be shown to the user
 * @param {string} key property key
 * @param {string} domain property domain
 */
export const shouldPropertyBeHidden = (key, domain) => {
    const isCollection = domain === consts.COLLECTION_URI;
    const isFile = domain === consts.FILE_URI;
    const isDirectory = domain === consts.DIRECTORY_URI;
    const isManaged = isCollection || isFile || isDirectory;

    switch (key) {
        case '@type':
        case consts.TYPE_URI:
        case consts.FILE_PATH_URI:
        case consts.DATE_DELETED_URI:
        case consts.DELETED_BY_URI:
            return true;
        case consts.LABEL_URI:
            return isManaged;
        case consts.COMMENT_URI:
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

/**
 * Creates a textual description of the type for the given metadata item
 * @param metadata
 * @param vocabulary
 * @returns {{label: string, description: string}} object containing the type label and description
 */
export const getTypeInfo = (metadata, vocabulary) => {
    const typeProp = metadata && metadata.find(prop => prop.key === '@type');
    const types = (typeProp && typeProp.values) || [];
    const shape = vocabulary.determineShapeForTypes(types.map(t => t.id));
    const type = getFirstPredicateId(shape, consts.SHACL_TARGET_CLASS);
    const {label = '', comment: description = ''} = types.find(t => t.id === type) || {};

    return {label, description};
};

/**
 * Creates a new IRI within this workspace, based on the given identifier and infix
 *
 * Please note that IRIs within the workspace always use http as scheme, regardless
 * of whether the app runs on https. This ensures consistent IRI generation and
 * add the ability to access the same IRI on different protocols.
 *
 * @param id
 * @param infix
 * @returns {string}
 */
export const createIri = (id, infix) => `http://${window.location.hostname}/${infix}/${id}`;

/**
 * Creates a new metadata IRI within this workspace
 *
 * @param id
 * @returns {string}
 * @see createIri
 */
export const createMetadataIri = (id) => createIri(id, 'iri');

/**
 * Creates a new vocabulary IRI within this workspace
 *
 * @param id
 * @returns {string}
 * @see createIri
 */
export const createVocabularyIri = (id) => createIri(id, 'vocabulary');

/**
 * Generates a compatible workspace IRI from the given iri.
 *
 * This method will return the same iri as was given, but with http as scheme
 * and without the port number.
 * This ensures consistent IRI generation and
 * add the ability to access the same IRI on different protocols.
 *
 * @param iri
 * @returns {string}
 */
export const url2iri = (iri) => {
    try {
        const url = new URL(iri);
        return `http://${url.hostname}${url.pathname}${url.search}${url.hash}`;
    } catch (e) {
        console.warn("Invalid uri given to convert to iri", iri);
        return iri;
    }
};

/**
 * Groups the validation errors of the same subject into a single array and the other array is the other errors
 * @returns {Object}
 */
export const partitionErrors = (errors, subject) => {
    const [entityErrors, otherErrors] = _.partition(errors, (e) => e.subject === subject);
    return {entityErrors, otherErrors};
};

/**
 * Returns true if the given value is truthy or zero or false
 * @param value
 */
export const isNonEmptyValue = (value) => Boolean(value) || value === 0 || value === false;

/**
 * Returns true if the given property have one or more non-empty values
 * @param property
 * @returns {boolean}
 */
export const hasValue = property => !!(property.values && Array.isArray(property.values) && property.values.filter(v => v.id || isNonEmptyValue(v.value)).length > 0);
