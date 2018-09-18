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
    const labelsById = extractLabelsByIdMap(vocabulary);

    if(!Array.isArray(expandedMetadata) || expandedMetadata.length != 1) {
        console.warn("Can not combine metadata for multiple subjects at a time. Provide an expanded JSON-LD structure for a single subject");
        return [];
    }

    return convertMetadataIntoPropertyList(expandedMetadata[0], labelsById);
}

/**
 * Converts a JSON-LD structure into a list of properties and values
 * @param metadata Expanded JSON-LD metadata about a single subject
 * @param labelsMap Map of predicate-uris to labels
 * @returns {Array}
 */
function convertMetadataIntoPropertyList(metadata, labelsMap) {
    const result = [];

    for (const predicate in metadata) {
        // Lookup the label in the vocabulary
        const label = labelsMap[predicate];

        // Ensure that we have a list of values for the predicate
        const values = asArray(metadata[predicate]);

        // If we have a label for this predicate in the vocabulary,
        // then add the property to the list
        if (label) {
            result.push(generatePropertyEntry(predicate, label, values));
        } else if (predicate === "@type") {
            // @type needs special attention: it is specified as a literal string
            // but should be treated as an object
            result.push(generatePropertyEntry(predicate, "Type", convertTypeEntries(values, labelsMap)));
        }
    }

    return result.sort(comparing(compareBy('label')));
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

export default combine;
