import * as jsonld from 'jsonld/dist/jsonld';

function combine(vocabulary, metadata) {
    return extractLabelsByIdMap(vocabulary)
        .then(labelsById => jsonld.expand(metadata)
            .then(expandedMetadata => {
                const root = expandedMetadata[0];
                const resultMap = Object.keys(root).reduce(
                    (result, key) => {
                        const label = labelsById[key];
                        if (label) {
                            const value = root[key][0]['@value'];
                            const values = result[label] || [];
                            values.push(value);

                            result[label] = values;
                        }
                        return result;
                    },
                    {}
                );

                return Object.keys(resultMap).map(label => ({label: label, values: resultMap[label]}));
            }));
}


function extractLabelsByIdMap(vocabulary) {
    return jsonld.expand(vocabulary)
        .then(expandedVocabulary => {
            const labelsById = {};
            expandedVocabulary.forEach(propertyDefinition => {
                let id = propertyDefinition["@id"];
                let label = propertyDefinition['http://www.w3.org/2000/01/rdf-schema#label'][0];
                labelsById[id] = label["@value"];
            });
            return labelsById;
        });
}

export default combine;
