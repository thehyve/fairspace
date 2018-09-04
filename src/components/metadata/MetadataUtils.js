import * as jsonld from 'jsonld/dist/jsonld';
import {compareBy, comparing} from "../../utils/comparators";


/**
 * Expands the json-ld format of the vocabulary and metadata and
 * combines them to make a list of objects with the label and value as keys.
 * @param vocabulary json-ld format where labels are specified.
 * @param metadata json-ld format with actual metadata.
 * @returns {*}
 */
function combine(vocabulary, metadata) {
    return Promise.all([extractLabelsByIdMap(vocabulary), jsonld.expand(metadata)])
        .then(([labelsById, expandedMetadata]) => {
            const root = expandedMetadata[0];
            const result = {};
            for (const key in root) {
                const label = labelsById[key];
                if (label) {
                    result[label] = root[key].sort(comparing(compareBy('@id'), compareBy('@value')));
                    // @type is not a label. Therefore, this needs to be a separate check. Where the label needs  to be retrieved.
                } else if (key === "@type") {
                    result["Type"] = root[key]
                        .map(type => ({"@id": type, "rdfs:label": labelsById[type]}))
                        .sort(comparing(compareBy('rdfs:label'), compareBy('@id')));
                }
            }
            return Object.keys(result).sort().map(label => ({label: label, values: result[label]}));
        })
        .catch(err => console.error('Error combining metadata and vocabulary', err));
}

/**
 * Maps the @id to the label.
 *
 * @param vocabulary json-ld format where labels are specified.
 * @returns {*}
 */
function extractLabelsByIdMap(vocabulary) {
    return jsonld.expand(vocabulary)
        .then(expandedVocabulary => {
            const labelsById = {};
            expandedVocabulary.forEach(property => {
                const id = property["@id"];
                const label = property['http://www.w3.org/2000/01/rdf-schema#label'][0]["@value"];
                labelsById[id] = label;
            });
            return labelsById;
        });
}

export default combine;
