import * as jsonld from 'jsonld/dist/jsonld';

function combine(vocabulary, metadata) {
    return extractLabelsByIdMap(vocabulary)
        .then(labelsById =>
            jsonld.expand(metadata)
                .then(expandedMetadata => {
                    const root = expandedMetadata[0];
                    const result = {};
                    for (const key in root) {
                        const label = labelsById[key];
                        if (label) {
                            result[label] = root[key].map(item => item['@value']);
                        }
                    }
                    return Object.keys(result).map(label => ({label: label, values: result[label]}));
                }));
}


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
