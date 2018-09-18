import {compareBy, comparing} from "../../utils/comparators";


/**
 * Expands the json-ld format of the vocabulary and metadata and
 * combines them to make a list of objects with the label and value as keys.
 *
 * Please note that only the metadata for the first subject will be used
 *
 * @param vocabulary json-ld format where labels are specified.
 * @param metadata in expanded json-ld format with actual metadata about one subject
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
function combine(vocabulary, metadata) {
    return Promise.all([extractLabelsByIdMap(vocabulary), metadata])
        .then(([labelsById, expandedMetadata]) => {
            if(!Array.isArray(expandedMetadata) || expandedMetadata.length == 0) {
                return [];
            }

            const subjectMetadata = expandedMetadata[0];
            const result = [];

            for (const predicate in subjectMetadata) {
                // Lookup the label in the vocabulary
                const label = labelsById[predicate];

                // Ensure that we have a list of values for the predicate
                const values = asArray(subjectMetadata[predicate]);

                // If we have a label for this predicate in the vocabulary,
                // then add the property to the list
                if (label) {
                    result.push({
                        key: predicate,
                        label: label,
                        values: values.sort(comparing(compareBy('@id'), compareBy('@value')))
                    });
                } else if (predicate === "@type") {
                    // @type is not a label. Therefore, this needs to be a separate check.
                    // Where the label needs  to be retrieved.
                    result.push({
                        key: predicate,
                        label: "Type",
                        values: values
                            .map(type => ({"@id": type, "rdfs:label": labelsById[type]}))
                            .sort(comparing(compareBy('rdfs:label'), compareBy('@id')))
                    });
                }
            }

            return result.sort(comparing(compareBy('label')));
        })
        .catch(err => console.error('Error combining metadata and vocabulary', err));
}

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
