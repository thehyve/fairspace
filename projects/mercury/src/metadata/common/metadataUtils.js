import _ from 'lodash';

import * as consts from '../../constants';
import {getFirstPredicateId, getFirstPredicateValue} from './jsonLdUtils';
import {determineShapeForTypes} from './vocabularyUtils';
import {isNonEmptyValue} from '../../common/utils/genericUtils';

/**
 * Returns the local part of the given uri
 * @param uri
 * @returns {string}
 */
export const getLocalPart = uri =>
    uri.includes('#')
        ? uri.substring(uri.lastIndexOf('#') + 1)
        : uri.substring(uri.lastIndexOf('/') + 1);

/**
 *
 * @param uri the URI to generate a label for
 * @param shortenExternalUris if true will generate a short label even if a URI doesn't belong to the current workspace
 * e.g. http://example.com/aaa/bbb => bbb
 * otherwise will leave external URIs unmodified
 * @returns {*}
 */
export function linkLabel(uri, shortenExternalUris = false) {
    try {
        const supportedLocalInfixes = ['/iri/', '/collections/'];
        const url = new URL(uri);

        // Local uris are treated separately, as we know its
        // structure
        if (url.hostname === window.location.hostname) {
            const foundInfix = supportedLocalInfixes.find(infix => url.pathname.startsWith(infix));
            if (foundInfix) {
                return `${url.pathname.substring(foundInfix.length)}${url.search}${url.hash}`;
            }
        }
        // eslint-disable-next-line no-empty
    } catch (e) {}

    return shortenExternalUris ? getLocalPart(uri) : uri;
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
    return (
        getFirstPredicateValue(entity, consts.LABEL_URI) ||
        getFirstPredicateValue(entity, consts.SHACL_NAME) ||
        (entity && entity['@id'] && linkLabel(entity['@id'], shortenExternalUris))
    );
}

/**
 * Returns the entity label, returns empty string if no label is present.
 *
 * This is different than 'getLabel' which will return the entity iri if no label is found.
 * @returns string
 */
export function getLabelStrict(entity) {
    return getFirstPredicateValue(entity, consts.LABEL_URI) || '';
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
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
        /[018]/g,
        // eslint-disable-next-line
        c => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
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
        case consts.CAN_LIST_URI:
        case consts.CAN_READ_URI:
        case consts.CAN_WRITE_URI:
        case consts.CAN_MANAGE_URI:
        case consts.CAN_ADD_SHARED_METADATA_URI:
        case consts.CAN_VIEW_PUBLIC_METADATA_URI:
        case consts.CAN_VIEW_PUBLIC_DATA_URI:
        case consts.CAN_QUERY_METADATA_URI:
        case consts.IS_ADMIN:
        case consts.IS_SUPERADMIN:
        case consts.IS_MEMBER_OF_URI:
        case consts.IS_MANAGER_OF_URI:
            return true;
        case consts.LABEL_URI:
            return isManaged;
        case consts.DATE_DELETED_URI:
        case consts.DELETED_BY_URI:
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
    const domainValue =
        domainKey && domainKey.values && domainKey.values[0] ? domainKey.values[0].id : undefined;
    return properties.filter(p => !shouldPropertyBeHidden(p.key, domainValue));
};

/**
 * Creates a textual description of the type for the given metadata item
 * @param linkedData    A single-subject jsonLd structure
 * @param vocabulary
 * @returns {{label: string, description: string}} object containing the type label and description
 */
export const getTypeInfo = (linkedDataItem, vocabulary) => {
    const types = linkedDataItem && linkedDataItem['@type'];

    if (!types) {
        return {};
    }

    const shape = determineShapeForTypes(vocabulary, types);

    return {
        typeIri: getFirstPredicateId(shape, consts.SHACL_TARGET_CLASS) || shape['@id'],
        label: getFirstPredicateValue(shape, consts.SHACL_NAME),
        description: getFirstPredicateValue(shape, consts.SHACL_DESCRIPTION),
        comment: getFirstPredicateValue(shape, consts.COMMENT_URI)
    };
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
export const createMetadataIri = id => createIri(id, 'iri');

/**
 * Creates a new vocabulary IRI within this workspace
 *
 * @param id
 * @returns {string}
 * @see createIri
 */
export const createVocabularyIri = id => createIri(id, 'vocabulary');

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
export const url2iri = iri => {
    try {
        const url = new URL(iri);
        return `http://${url.hostname}${url.pathname}${url.search}${url.hash}`;
    } catch (e) {
        console.warn('Invalid uri given to convert to iri', iri);
        return iri;
    }
};

/**
 * Generates a namespaced iri, if the given iri is part of any of the namespaces
 * @param iri
 * @param namespaces
 * @returns {string|*}
 */
export const getNamespacedIri = (iri, namespaces) => {
    if (!iri) return '';

    // eslint-disable-next-line no-param-reassign
    iri = decodeURI(iri);

    if (!namespaces) return iri;

    const namespace = namespaces.find(n => iri.startsWith(n.namespace));

    return namespace ? iri.replace(namespace.namespace, namespace.prefix + ':') : iri;
};

/**
 * Groups the validation errors of the same subject into a single array and the other array is the other errors
 * @returns {Object}
 */
export const partitionErrors = (errors, subject) => {
    const [entityErrors, otherErrors] = _.partition(errors, e => e.subject === subject);
    return {entityErrors, otherErrors};
};

/**
 * Returns true if the either given value or id (or both) are part of the property values.
 * @param {array} values
 * @param {string} value
 * @param {string} id
 */
export const valuesContainsValueOrId = (values, value, id) => {
    if (!Array.isArray(values) || values.length === 0 || (!value && !id)) {
        return false;
    }

    return values.some(v => (v.id && v.id === id) || (v.value && v.value === value));
};

/**
 * Returns true if the given list of values has one or more non-empty values
 * @param values
 * @returns {boolean}
 */
export const hasValue = values =>
    !!(
        values &&
        Array.isArray(values) &&
        values.filter(v => v.id || isNonEmptyValue(v.value)).length > 0
    );
