// @ts-nocheck
import * as constants from "../../constants";
import {getFirstPredicateId} from "./jsonLdUtils";
import {determineShapeForProperty, isRdfList} from "./vocabularyUtils";
import {getLabel, getLabelStrict} from "./metadataUtils";
import {compareBy, comparing, flattenShallow, isNonEmptyValue} from "../../common/utils/genericUtils";

/**
 * Generates an entry to describe a single value for a property
 * @param entry
 * @returns {{id: *, label, value: *}}
 */
const generateValueEntry = (entry, allMetadata) => {
    let label = "";

    if (entry['@id']) {
        label = getLabelStrict(entry);

        if (label === "") {
            const elementFromAll = allMetadata[entry['@id']];
            label = getLabel(elementFromAll);
        }
    }

    return {
        id: entry['@id'],
        value: entry['@value'],
        label
    };
};

/**
 * Converts a JSON-LD structure into a list of values per predicate
 * @param metadata Expanded JSON-LD metadata about a single subject. The subject must have a '@type' property
 * @param propertyShapes List of propertyShapes that should be included
 * @param allMetadata All known metadata to be processed. Is used to retrieve labels for associated entities
 * @returns {Array}
 */
export const fromJsonLd = (metadata, propertyShapes = [], allMetadata = {}, vocabulary) => {
    const iri = metadata['@id'];
    const valuesByPredicate = {};

    const expectsRdfList = predicateUri => {
        const propertyShape = propertyShapes.find(shape => getFirstPredicateId(shape, constants.SHACL_PATH) === predicateUri);
        return propertyShape && isRdfList(propertyShape);
    };

    const getValuesFirstPredicateId = predicate => {
    // const relevantItems = allMetadata[iri][predicate] ?? [];
        const relevantItems = Object.values(allMetadata).filter(item => Object.prototype.hasOwnProperty.call(item, predicate) && item[predicate].find(v => v['@id'] === iri) !== undefined);
        const newItems = [];

        for (let i = 0; i < relevantItems.length; i++) {
            const newItem = generateValueEntry(relevantItems[i], allMetadata);
            newItems.push(newItem);
        }

        return newItems;
    };

    const processFirstPredicateId = (predicateUri: string) => {
        const predicate = getFirstPredicateId(vocabulary.find(e => e['@id'] === predicateUri), constants.SHACL_INVERS_PATH);
        valuesByPredicate[predicateUri] = getValuesFirstPredicateId(predicate);
    };

    const processValues = (predicateUri: string) => {
    // Ensure that we have a list of values for the predicate
        if (!Array.isArray(metadata[predicateUri])) {
            return;
        }

        let values;

        if (predicateUri === '@type') {
            // Treat @type as special case, as it does not have the correct
            // format (with @id or @value)
            values = metadata[predicateUri].map(t => ({
                id: t
            }));
        } else if (expectsRdfList(predicateUri)) {
            // RDF lists in JSON LD are arrays in a container with key '@list'
            // We want to use just the arrays. If there are multiple lists
            // they are concatenated
            // Please note that entries are not sorted as rdf:lists are meant to be ordered
            values = flattenShallow(metadata[predicateUri].map(entry => entry['@list'] ? entry['@list'] : [entry])).map(entry => generateValueEntry(entry, allMetadata));
        } else {
            // Convert json-ld values into our internal format and
            // sort the values
            values = metadata[predicateUri].map(entry => generateValueEntry(entry, allMetadata)).sort(comparing(compareBy('label'), compareBy('id'), compareBy('value')));
        }

        valuesByPredicate[predicateUri] = values;
    };

    propertyShapes.forEach(shape => {
        const predicateUri = getFirstPredicateId(shape, constants.SHACL_PATH);

        if (predicateUri.startsWith('_')) {
            processFirstPredicateId(predicateUri);
        } else {
            processValues(predicateUri);
        }
    });
    return valuesByPredicate;
};

/**
 * Returns the given values in the right container. By default, no container is used
 * If the predicate requires an rdf:List, the values are put into a {'@list': ...} object
 * Whevever the data type is available it will be sent for values that are not part of RDF List
 * @param values
 * @param shape
 * @returns {*}
 */
const jsonLdWrapper = (values, shape) => {
    if (isRdfList(shape)) {
        return {
            '@list': values.map(({
                id,
                value
            }) => ({
                '@id': id,
                '@value': value
            }))
        };
    }

    const dataType = getFirstPredicateId(shape, constants.SHACL_DATATYPE);
    return values.map(({
        id,
        value
    }) => ({
        '@id': id,
        '@value': value,
        "@type": dataType
    }));
};

/**
 * Converts information for a subject and predicate into json-ld
 * @param subject       Subject URI
 * @param predicate     Predicate URI
 * @param values        List of values for the given predicate. Expected keys: id or value
 * @param vocabulary    vocabularyUtils in expanded json-ld format
 * @returns {*}
 */
export const toJsonLd = (subject, predicate, values, vocabulary) => {
    if (!subject || !predicate || !values) {
        return null;
    }

    const validValues = values.filter(({
        id,
        value
    }) => isNonEmptyValue(value) || !!id);

    // Return special nil value if no values or if all values are empty or invalid (non-truthy except zero or false)
    if (validValues.length === 0) {
        return {
            '@id': subject,
            [predicate]: {
                '@id': constants.NIL_URI
            }
        };
    }

    return {
        '@id': subject,
        [predicate]: jsonLdWrapper(validValues, determineShapeForProperty(vocabulary, predicate))
    };
};

/**
 * Extracts the metadata that describes the given subject from the given metadata
 * @param expandedMetadata
 * @param subject
 * @returns {*|{}}
 */
export const getJsonLdForSubject = (expandedMetadata, subject) => {
    // when expandedMetadata is a dictionary
    if (expandedMetadata.constructor === Object) {
        return expandedMetadata[subject];
    }

    // when expandedMetadata is a list
    if (!Array.isArray(expandedMetadata) || !subject && expandedMetadata.length !== 1) {
        console.warn("Can not combine metadata for multiple subjects at a time. Provide an expanded JSON-LD structure for a single subject");
        return {};
    }

    return expandedMetadata.find(item => item['@id'] === subject) || {};
};

const normalizeType = entry => {
    if (!entry['@type'] && entry[constants.RDF_TYPE]) {
        const {
            [constants.RDF_TYPE]: types,
            ...rest
        } = entry;
        return {
            '@type': types.map(t => t['@id']),
            ...rest
        };
    }

    return entry;
};

/**
 * Returns metadata in a dictionary. For the right metadata panel a lot of data is
 * retrieved by subject id. Loading a study with over 10.000 samples took a few seconds,
 * with the dictionary implementation normalizing metadata is reduced to 10s of milliseconds.
 * @returns
 */
export const normalizeTypesBySubjectId = expandedMetadata => {
    const normalizedTypes = {};
    expandedMetadata.forEach(e => {
        normalizedTypes[e['@id']] = normalizeType(e);
    });
    return normalizedTypes;
};

/**
 * Replaces all occurrences of rdf:type with @type
 * @param expandedMetadata
 * @returns {*}
 */
export const normalizeTypes = expandedMetadata => expandedMetadata.map(e => normalizeType(e));