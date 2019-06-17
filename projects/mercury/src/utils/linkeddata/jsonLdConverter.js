import {compareBy, comparing, flattenShallow} from "../genericUtils";
import * as constants from "../../constants";
import {getFirstPredicateId, getFirstPredicateValue, normalizeJsonLdResource} from "./jsonLdUtils";
import {isRdfList} from "./vocabularyUtils";
import {isNonEmptyValue, simplifyUriPredicates} from "./metadataUtils";

/**
 * Generates a property entry for the given type(s)
 * @param types  Array of uris of the type of an entity
 * @returns {{allowMultiple: boolean, values: *, label: string, key: string, machineOnly: boolean}}
 */
const generateTypeProperty = (vocabulary, types) => {
    const typeValues = types.map(type => {
        const shape = vocabulary.determineShapeForTypes([type]);
        return {
            id: type,
            label: getFirstPredicateValue(shape, constants.SHACL_NAME, type),
            comment: getFirstPredicateValue(shape, constants.SHACL_DESCRIPTION, type)
        };
    });

    return {
        key: '@type',
        label: 'Type',
        values: typeValues,
        maxValuesCount: 1,
        machineOnly: true
    };
};

/**
 * Generates an entry to describe a single value for a property
 * @param entry
 * @param allMetadata
 * @returns {{id: *, label, value: *}}
 */
const generateValueEntry = (entry, allMetadata) => ({
    id: entry['@id'],
    value: entry['@value'],
    otherEntry: entry['@id'] ? simplifyUriPredicates(normalizeJsonLdResource(allMetadata.find(element => element['@id'] === entry['@id']))) : {}
});

/**
 * Converts a JSON-LD structure into a list of properties and values
 * @param metadata Expanded JSON-LD metadata about a single subject. The subject must have a '@type' property
 * @param propertyShapes List of propertyShapes that should be included
 * @param allMetadata All known metadata to be processed. Is used to retrieve labels for associated entities
 * @returns {Array}
 */
const convertMetadataIntoPropertyList = (metadata, propertyShapes = [], allMetadata = [], vocabulary) => {
    const prefilledProperties = [];

    Object.keys(metadata)
        .forEach(predicateUri => {
            const propertyShape = propertyShapes
                .find(shape => getFirstPredicateId(shape, constants.SHACL_PATH) === predicateUri);

            if (!propertyShape) {
                return;
            }

            // Ensure that we have a list of values for the predicate
            if (!Array.isArray(metadata[predicateUri])) {
                console.warn("Metadata should be provided in expanded form");
                return;
            }

            let values;
            if (isRdfList(propertyShape)) {
                // RDF lists in JSON LD are arrays in a container with key '@list'
                // We want to use just the arrays. If there are multiple lists
                // they are concatenated
                // Please note that entries are not sorted as rdf:lists are meant to be ordered
                values = flattenShallow(metadata[predicateUri].map(
                    entry => (entry['@list'] ? entry['@list'] : [entry])
                )).map(entry => generateValueEntry(entry, allMetadata));
            } else {
                // Convert json-ld values into our internal format and
                // sort the values
                values = metadata[predicateUri]
                    .map(entry => generateValueEntry(entry, allMetadata))
                    .sort(comparing(compareBy(e => e.otherEntry && e.otherEntry.label), compareBy('id'), compareBy('value')));
            }

            prefilledProperties.push({...vocabulary.generatePropertyEntry(predicateUri, propertyShape), values});
        });

    return prefilledProperties;
};

/**
 * Determines a list of properties for which no value is present in the metadata
 * @param metadata
 * @param propertyShapes
 * @param vocabulary
 * @returns {{key, label, values, range, maxValuesCount}[]}
 */
const determineAdditionalEmptyProperties = (metadata, propertyShapes = [], vocabulary) => {
    // Also add an entry for fields not yet entered
    const additionalProperties = propertyShapes
        .filter(shape => !Object.keys(metadata).includes(getFirstPredicateId(shape, constants.SHACL_PATH)))
        .map((shape) => {
            const predicateUri = getFirstPredicateId(shape, constants.SHACL_PATH);
            return {...vocabulary.generatePropertyEntry(predicateUri, shape), values: []};
        });

    return additionalProperties;
};


/**
 *
 * @param vocabulary
 * @param metadataItem
 * @param types
 * @param propertyShapes
 * @param expandedMetadata
 * @returns {*[]}
 */
const generatePropertiesForMetadata = (vocabulary, metadataItem, types, propertyShapes, expandedMetadata) => {
    // Actually convert the metadata into a list of properties
    const properties = convertMetadataIntoPropertyList(metadataItem, propertyShapes, expandedMetadata, vocabulary);
    const emptyProperties = determineAdditionalEmptyProperties(metadataItem, propertyShapes, vocabulary);

    // An entry with information on the type is returned as well for display purposes
    const typeProperty = generateTypeProperty(vocabulary, types);

    return [...properties, ...emptyProperties, typeProperty];
};

/**
 * Combines the given metadata with the current vocabulary to make a list of
 * objects with the label and value as keys.
 *
 * Please note that only the metadata for the first subject will be used
 *
 * @param expandedMetadata  Metadata in expanded json-ld format with actual metadata about one subject
 * @param subject           Subject to fromJsonLd the metadata for. If not provided, the metadata is expected to contain
 *                          information on a single entity
 * @param vocabulary        vocabularyUtils object describing the vocabulary
 * @returns [Any] A promise resolving in an array with metadata. Each element will look like this:
 * {
 *      key: "http://fairspace.io/ontology#description",
 *      label: "Description",
 *      values: [
 *          { id: "http://fairspace.com/collections/1", label: "My collection" },
 *          { value: "Literal value"}
 *      ]
 *  }
 */
export const fromJsonLd = (expandedMetadata, subject, vocabulary) => {
    if (!Array.isArray(expandedMetadata) || (!subject && expandedMetadata.length !== 1)) {
        console.warn("Can not combine metadata for multiple subjects at a time. Provide an expanded JSON-LD structure for a single subject");
        return [];
    }

    // If no subject is provided, use the first (and only) entry in the metadata
    const sub = subject || expandedMetadata[0]['@id'];
    const metadataItem = subject ? expandedMetadata.find(item => item['@id'] === sub) : expandedMetadata[0];

    if (!metadataItem) {
        console.warn(`The given subject ${sub} is unknown`);
        return [];
    }

    if (!Array.isArray(metadataItem['@type'])) {
        console.warn("Can not fromJsonLd metadata without a type or that is not expanded");
        return [];
    }

    // Determine properties allowed for the given type
    const types = metadataItem['@type'];
    const propertyShapes = vocabulary.determinePropertyShapesForTypes(types);
    return generatePropertiesForMetadata(vocabulary, metadataItem, types, propertyShapes, expandedMetadata);
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
            '@list': values.map(({id, value}) => ({'@id': id, '@value': value}))
        };
    }

    const dataType = getFirstPredicateId(shape, constants.SHACL_DATATYPE);

    return values.map(({id, value}) => ({'@id': id, '@value': value, "@type": dataType}));
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

    const validValues = values.filter(({id, value}) => isNonEmptyValue(value) || !!id);

    // Return special nil value if no values or if all values are empty or invalid (non-truthy except zero or false)
    if (validValues.length === 0) {
        return {
            '@id': subject,
            [predicate]: {'@id': constants.NIL_URI}
        };
    }

    return {
        '@id': subject,
        [predicate]: jsonLdWrapper(validValues, vocabulary.determineShapeForProperty(predicate))
    };
};

/**
 * Returns a linked data object for a new entity. The object can be used in form generation
 *
 * Please note that only the metadata for the first subject will be used
 *
 * @param shape The shape for the
 * @param subject Subject to fromJsonLd the metadata for. If not provided, the metadata is expected to contain
 *                information on a single entity
 * @returns [Any] A promise resolving in an array with metadata. Each element will look like this:
 * {
 *      key: "http://fairspace.io/ontology#description",
 *      label: "Description",
 *      values: [
 *          { id: "http://fairspace.com/collections/1", label: "My collection" },
 *          { value: "Literal value"}
 *      ]
 *  }
 */
export const emptyLinkedData = (vocabulary, shape) => {
    if (!shape || !vocabulary) {
        return [];
    }

    // Determine properties allowed for the given type
    const propertyShapes = vocabulary.determinePropertyShapesForNodeShape(shape);
    const types = (shape[constants.SHACL_TARGET_CLASS] || []).map(node => node['@id']);

    // Generate a list of empty properties
    return generatePropertiesForMetadata(vocabulary, {}, types, propertyShapes, [])
        .map(p => ({...p, isEditable: true}));
};

/**
 * Replaces all occurrences of rdf:type with @type
 * @param expandedMetadata
 * @returns {*}
 */
export const normalizeTypes = (expandedMetadata) => expandedMetadata.map(e => {
    if (!e['@type'] && e[constants.RDF_TYPE]) {
        const {[constants.RDF_TYPE]: types, ...rest} = e;
        return {
            '@type': types.map(t => t['@id']),
            ...rest
        };
    }
    return e;
});
