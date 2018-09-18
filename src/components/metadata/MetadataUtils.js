import {compareBy, comparing} from "../../utils/comparators";

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
    const vocabularyById = groupVocabularyById(vocabulary);

    // Determine properties allowed for the given type
    // TODO: Refactor to use some way of caching this information
    const typePredicates = determinePredicatesForType(vocabulary, metadataItem['@type']);

    // Actually convert the metadata into a list of properties
    return convertMetadataIntoPropertyList(expandedMetadata[0], vocabularyById, typePredicates);
}

/**
 * Converts a JSON-LD structure into a list of properties and values
 * @param metadata Expanded JSON-LD metadata about a single subject. The subject must have a '@type' property
 * @param vocabularyMap Map of predicate-uris to predicates
 * @param predicates List of predicates that should be included
 * @returns {Array}
 */
function convertMetadataIntoPropertyList(metadata, vocabularyMap, predicates = []) {
    const prefilledProperties = [];

    // Add the metadata already available
    for (const predicateUri in metadata) {
        // Skip this predicate if it is not allowed for the current type
        if (!predicates.find(predicate => predicate['@id'] === predicateUri)) {
            continue;
        }

        // Skip this predicate if it is not in the vocabulary
        const vocabularyEntry = vocabularyMap[predicateUri];

        if(!vocabularyEntry) {
            continue;
        }

        // Ensure that we have a list of values for the predicate
        let values = asArray(metadata[predicateUri]);

        // @type needs special attention: it is specified as a literal string
        // but should be treated as an object
        if (predicateUri === "@type") {
            values = convertTypeEntries(values, vocabularyMap);
        }

        prefilledProperties.push(generatePropertyEntry(predicateUri, values, vocabularyEntry));
    }

    // Also add an entry for fields not yet entered
    const additionalProperties = predicates
        .filter(predicate => !Object.keys(metadata).includes(predicate['@id']))
        .map(predicate => {
            const predicateUri = predicate['@id'];
            const vocabularyEntry = vocabularyMap[predicateUri];
            return generatePropertyEntry(predicateUri, [], vocabularyEntry)
        });

    return [
        ...prefilledProperties.sort(comparing(compareBy('label'))),
        ...additionalProperties.sort(comparing(compareBy('label')))
    ];
}

function generatePropertyEntry(predicate, values, vocabularyEntry) {
    const label = vocabularyEntry['@label'];
    const range = vocabularyEntry['http://www.w3.org/2000/01/rdf-schema#range'] ? vocabularyEntry['http://www.w3.org/2000/01/rdf-schema#range'][0] : '';
    const allowMultiple = vocabularyEntry['http://fairspace.io/ontology#allowMultiple'] ? vocabularyEntry['http://fairspace.io/ontology#allowMultiple'][0] : false;

    return {
        key: predicate,
        label: label,
        values: values.sort(comparing(compareBy('rdfs:label'), compareBy('@id'), compareBy('@value'))),
        range: range,
        allowMultiple: allowMultiple
    };
}


function convertTypeEntries(values, vocabularyMap) {
    return values
        .map(type => ({"@id": type, "rdfs:label": vocabularyMap[type]['@label']}))
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
 * Groups the vocabulary by resource id
 *
 * @param vocabulary json-ld format where labels are specified.
 * @returns {*}
 */
function groupVocabularyById(vocabulary) {
    const vocabularyById = {};
    vocabulary.forEach(property => {
        vocabularyById[property['@id']] = {...property, '@label': property['http://www.w3.org/2000/01/rdf-schema#label'][0]["@value"]};
    });

    return vocabularyById;
}

/**
 * Returns a list of predicates (objects from vocabulary) that is allowed for the given type of object
 * @param vocabulary
 * @param type
 */
function determinePredicatesForType(vocabulary, type) {
    const typeArray = asArray(type);
    const isProperty = entry => entry['@type'] === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property';
    const isInDomain = entry => {
        const domain = asArray(entry['http://www.w3.org/2000/01/rdf-schema#domain'])
        return domain.find(domainEntry => typeArray.includes(domainEntry['@id']));
    }

    return vocabulary.filter(entry => isProperty(entry) && isInDomain(entry));
}



export default combine;
