import {compareBy, comparing} from "../../utils/comparators";

class Vocabulary {
    /**
     * Stores the vocabulary
     * @param vocabulary    Expanded version of the vocabulary to use
     */
    constructor(vocabulary) {
        this.vocabulary = vocabulary;

        // Cache a version of the vocabulary by id, to do easy lookups
        this.vocabularyById = this._groupVocabularyById();

        // Create an empty cache to store the allowed predicates for a given type
        this.predicateForTypeCache = {}
    }

    /**
     * Combines the given metadata with the current vocabulary to make a list of
     * objects with the label and value as keys.
     *
     * Please note that only the metadata for the first subject will be used
     *
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
    combine(expandedMetadata) {
        if(!Array.isArray(expandedMetadata) || expandedMetadata.length !== 1) {
            console.warn("Can not combine metadata for multiple subjects at a time. Provide an expanded JSON-LD structure for a single subject");
            return [];
        }

        const metadataItem = expandedMetadata[0];
        if (!metadataItem['@type']) {
            console.warn("Can not combine metadata without a type");
            return [];

        }

        // Determine properties allowed for the given type
        const typePredicates = this._determinePredicatesForTypes(metadataItem['@type']);

        // Actually convert the metadata into a list of properties
        const properties = this._convertMetadataIntoPropertyList(expandedMetadata[0], typePredicates);
        const emptyProperties = this._determineAdditionalEmptyProperties(expandedMetadata[0], typePredicates);

        return [...properties, ...emptyProperties];
    }

    /**
     * Converts a JSON-LD structure into a list of properties and values
     * @param metadata Expanded JSON-LD metadata about a single subject. The subject must have a '@type' property
     * @param predicates List of predicates that should be included
     * @returns {Array}
     */
    _convertMetadataIntoPropertyList(metadata, predicates = []) {
        const prefilledProperties = [];

        // Add the metadata already available
        for (const predicateUri in metadata) {
            // Skip this predicate if it is not allowed for the current type
            if (!predicates.find(predicate => predicate['@id'] === predicateUri)) {
                continue;
            }

            // Skip this predicate if it is not in the vocabulary
            const vocabularyEntry = this.vocabularyById[predicateUri];

            if (!vocabularyEntry) {
                continue;
            }

            // Ensure that we have a list of values for the predicate
            let values = Vocabulary._asArray(metadata[predicateUri]);

            // @type needs special attention: it is specified as a literal string
            // but should be treated as an object
            if (predicateUri === "@type") {
                values = Vocabulary._convertTypeEntries(values, this.vocabularyById);
            }

            prefilledProperties.push(Vocabulary._generatePropertyEntry(predicateUri, values, vocabularyEntry));
        }

        return prefilledProperties.sort(comparing(compareBy('label')));
    }

    /**
     * Determines a list of properties for which no value is present in the metadata
     * @param metadata
     * @param predicates
     * @returns {{key, label, values, range, allowMultiple}[]}
     */
    _determineAdditionalEmptyProperties(metadata, predicates = []) {
        // Also add an entry for fields not yet entered
        const additionalProperties = predicates
            .filter(predicate => !Object.keys(metadata).includes(predicate['@id']))
            .map(predicate => {
                const predicateUri = predicate['@id'];
                const vocabularyEntry = this.vocabularyById[predicateUri];
                return Vocabulary._generatePropertyEntry(predicateUri, [], vocabularyEntry)
            });

        return additionalProperties.sort(comparing(compareBy('label')));
    }

    /**
     * Groups the vocabulary by resource id
     *
     * @param vocabulary json-ld format where labels are specified.
     * @returns {*}
     */
    _groupVocabularyById() {
        return this.vocabulary.reduce((vocabularyById, entry) => {
            vocabularyById[entry['@id']] = Vocabulary.expandWithLabel(entry);
            return vocabularyById;
        }, {});
    }

    /**
     * Returns a list of predicates (objects from vocabulary) that is allowed for the given types of object
     * @param vocabulary
     * @param type
     */
    _determinePredicatesForTypes(types) {
        const typeArray = Vocabulary._asArray(types);

        return typeArray
            .map(type => this._determinePredicatesForType(type))
            .reduce((fullList, typeList) => fullList.concat(typeList), [])
            .filter((value, index, self) => self.indexOf(value) === index);
    }

    /**
     * Returns a list of predicates (objects from vocabulary) that is allowed for the given type of object
     * @param vocabulary
     * @param type
     */
    _determinePredicatesForType(type) {
        if(this.predicateForTypeCache[type]) {
            return this.predicateForTypeCache[type];
        }

        const isProperty = entry =>
            Vocabulary._asArray(entry['@type']).includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#Property');

        const isInDomain = entry => {
            const domain = Vocabulary._asArray(entry['http://www.w3.org/2000/01/rdf-schema#domain'])
            return domain.find(domainEntry => domainEntry['@id'] === type);
        }

        const predicates = this.vocabulary.filter(entry => isProperty(entry) && isInDomain(entry));
        return this.predicateForTypeCache[type] = predicates;
    }

    /**
     * Generates a list entry for a single property, with the values specified
     * @param predicate
     * @param values
     * @param vocabularyEntry
     * @returns {{key: string, label: string, values: [], range: string, allowMultiple: boolean}}
     * @private
     */
    static _generatePropertyEntry(predicate, values, vocabularyEntry) {
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

    static _convertTypeEntries(values, vocabularyMap) {
        return values
            .map(type => ({"@id": type, "rdfs:label": vocabularyMap[type]['@label']}))
    }

    /**
     * Ensures the given input is an array. If not, the input will be added to a singletonlist
     * @param value
     * @returns {*}
     */
    static _asArray(value) {
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
     * Expands the given vocabularyEntry with a '@label' entry
     * @param vocabularyEntry
     * @returns {{"@label": *}}
     */
    static expandWithLabel(vocabularyEntry) {
        return {
            ...vocabularyEntry,
            '@label': vocabularyEntry['http://www.w3.org/2000/01/rdf-schema#label'][0]["@value"]
        }
    }

}

export default Vocabulary;
