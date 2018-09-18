import {compareBy, comparing} from "../../utils/comparators";

const typeVocabularyEntry = {
    '@id': '@type',
    'rdfs:label': 'Type'
}

/**
 * Expands the json-ld format of the vocabulary and metadata and
 * combines them to make a list of objects with the label and value as keys.
 *
 * Please note that only the metadata for the first subject will be used
 *
 * @param vocabulary json-ld format where labels are specified.
 * @param expandedMetadata Metadata in expanded json-ld format with actual metadata about one subject
 * @returns A promise resolving in an array with metadata. Each element will look like this:
 * {
 *      key: "fairspace:description",
 *      label: "Description",
 *      values: [
 *          { "@id": "http://fairspace.com/collections/1", "rdfs:label": "My collection" },
 *          { "@value": "Literal value"}
 *      ]
 *  }
 */
function combine(vocabulary, expandedMetadata) {
    if(!Array.isArray(expandedMetadata) || expandedMetadata.length != 1) {
        console.warn("Can not combine metadata for multiple subjects at a time. Provide an expanded JSON-LD structure for a single subject");
        return [];
    }

    const metadataItem = expandedMetadata[0];
    if (!metadataItem['@type']) {
        console.warn("Can not combine metadata without a type");
        return [];

    }

    // Lookup labels
    // TODO: Refactor to only do this once
    const labelsById = extractLabelsByIdMap(vocabulary);

    // Determine properties allowed for the given type
    // TODO: Refactor to use some way of caching this information
    const typePredicates = determinePredicatesForType(vocabulary, metadataItem['@type']);

    // Actually convert the metadata into a list of properties
    return convertMetadataIntoPropertyList(expandedMetadata[0], labelsById, typePredicates);
}

/**
 * Converts a JSON-LD structure into a list of properties and values
 * @param metadata Expanded JSON-LD metadata about a single subject. The subject must have a '@type' property
 * @param labelsMap Map of predicate-uris to labels
 * @param predicates List of predicates that should be included
 * @returns {Array}
 */
function convertMetadataIntoPropertyList(metadata, labelsMap, predicates = []) {
    const prefilledProperties = [];

    // Add the metadata already available
    for (const predicateUri in metadata) {
        // Skip this predicate if it is not allowed for the current type
        if (!predicates.find(predicate => predicate['@id'] === predicateUri)) {
            continue;
        }

        // Lookup the label in the vocabulary
        const label = labelsMap[predicateUri];

        // Ensure that we have a list of values for the predicate
        const values = asArray(metadata[predicateUri]);

        // If we have a label for this predicate in the vocabulary,
        // then add the property to the list
        if (label) {
            prefilledProperties.push(generatePropertyEntry(predicateUri, label, values));
        } else if (predicateUri === "@type") {
            // @type needs special attention: it is specified as a literal string
            // but should be treated as an object
            prefilledProperties.push(generatePropertyEntry(predicateUri, typeVocabularyEntry['rdfs:label'], convertTypeEntries(values, labelsMap)));
        }
    }

    // Also add an entry for fields not yet entered
    const additionalProperties = predicates
        .filter(predicate => !Object.keys(metadata).includes(predicate['@id']))
        .map(predicate => generatePropertyEntry(predicate['@id'], predicate['rdfs:label'], []));

    return [
        ...prefilledProperties.sort(comparing(compareBy('label'))),
        ...additionalProperties.sort(comparing(compareBy('label')))
    ];
}

function generatePropertyEntry(predicate, label, values) {
    return {
        key: predicate,
        label: label,
        values: values.sort(comparing(compareBy('rdfs:label'), compareBy('@id'), compareBy('@value')))
    };
}


function convertTypeEntries(values, labelsMap) {
    return values
        .map(type => ({"@id": type, "rdfs:label": labelsMap[type]}))
}

/**
 * Ensures the given input is an array. If not, the input will be added to a singletonlist
 * @param value
 * @returns {*}
 */
function asArray(value) {
    if(value === undefined) {
        return [];
    }

    if(Array.isArray(value)) {
        return value;
    } else {
        return [value];
    }
}

/**
 * Maps the @id to the label.
 *
 * @param vocabulary json-ld format where labels are specified.
 * @returns {*}
 */
function extractLabelsByIdMap(vocabulary) {
    const labelsById = {};
    vocabulary.forEach(property => {
        const id = property["@id"];
        const label = property['http://www.w3.org/2000/01/rdf-schema#label'][0]["@value"];
        labelsById[id] = label;
    });

    return labelsById;
}

/**
 * Returns a list of predicates (objects from vocabulary) that is allowed for the given type of object
 * @param vocabulary
 * @param type
 */
function determinePredicatesForType(vocabulary, type) {
    const isProperty = entry => entry['@type'] === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property';
    const isInDomain = entry => asArray(entry['http://www.w3.org/2000/01/rdf-schema#domain']).find(domainEntry => domainEntry['@id'] === type);

    const vocabularyPredicates = vocabulary.filter(entry => isProperty(entry) && isInDomain(entry));

    // The type is allowed for everything
    return [...vocabularyPredicates, typeVocabularyEntry];
}



export default combine;
