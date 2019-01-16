import {compareBy, comparing} from "../../utils/comparisionUtils";
import * as constants from "../../constants";
import {getSingleValue} from "../../utils/metadataUtils";

class Vocabulary {
    /**
     * Stores the vocabulary
     * @param vocabulary    Expanded version of the vocabulary to use
     */
    constructor(vocabulary) {
        this.vocabulary = vocabulary;

        // Cache a version of the vocabulary by id, to do easy lookups
        this.vocabularyById = this.groupVocabularyById();
    }

    /**
     * Combines the given metadata with the current vocabulary to make a list of
     * objects with the label and value as keys.
     *
     * Please note that only the metadata for the first subject will be used
     *
     * @param expandedMetadata Metadata in expanded json-ld format with actual metadata about one subject
     * @param subject Subject to combine the metadata for. If not provided, the metadata is expected to contain
     *                information on a single entity
     * @returns A promise resolving in an array with metadata. Each element will look like this:
     * {
     *      key: "http://fairspace.io/ontology#description",
     *      label: "Description",
     *      values: [
     *          { id: "http://fairspace.com/collections/1", label: "My collection" },
     *          { value: "Literal value"}
     *      ]
     *  }
     */
    combine(expandedMetadata, subject) {
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
            console.warn("Can not combine metadata without a type or that is not expanded");
            return [];
        }

        // Determine properties allowed for the given type
        const typePredicates = this.determinePredicatesForTypes(metadataItem['@type']);

        // Actually convert the metadata into a list of properties
        const properties = this.convertMetadataIntoPropertyList(metadataItem, typePredicates, expandedMetadata);
        const emptyProperties = this.determineAdditionalEmptyProperties(metadataItem, typePredicates);

        return [...properties, ...emptyProperties];
    }

    /**
     * Looks up an entity in the vocabulary
     * @param id
     */
    getById(id) {
        return this.vocabularyById[id] || {"@id": id};
    }

    /**
     * Returns a list of classes marked as fairspace entities
     */
    getFairspaceClasses() {
        return this.vocabulary
            .filter(entry => entry['@type'].includes(constants.CLASS_URI) && getSingleValue(entry, constants.FAIRSPACE_ENTITY_URI));
    }

    /**
     * Converts a JSON-LD structure into a list of properties and values
     * @param metadata Expanded JSON-LD metadata about a single subject. The subject must have a '@type' property
     * @param predicates List of predicates that should be included
     * @returns {Array}
     */
    convertMetadataIntoPropertyList(metadata, predicates = [], allMetadata = []) {
        const prefilledProperties = [];

        Object.keys(metadata)
            .forEach(predicateUri => {
                if (predicateUri !== "@type" && !predicates.find(predicate => predicate['@id'] === predicateUri)) {
                    return;
                }

                // Skip this predicate if it is not in the vocabulary
                const vocabularyEntry = this.vocabularyById[predicateUri];

                if (predicateUri !== "@type" && !vocabularyEntry) {
                    return;
                }

                // Ensure that we have a list of values for the predicate
                if (!Array.isArray(metadata[predicateUri])) {
                    console.warn("Metadata should be provided in expanded form");
                    return;
                }

                const values = (predicateUri === "@type")
                    // @type needs special attention: it is specified as a literal string
                    // but should be treated as an object
                    ? this.convertTypeEntries(metadata[predicateUri])
                    : metadata[predicateUri].map(i => ({
                        id: i['@id'],
                        value: i['@value'],
                        label: Vocabulary.lookupLabel(i['@id'], allMetadata)
                    }));

                prefilledProperties.push(Vocabulary.generatePropertyEntry(predicateUri, values, vocabularyEntry));
            });

        return prefilledProperties.sort(compareBy('label'));
    }

    /**
     * Determines a list of properties for which no value is present in the metadata
     * @param metadata
     * @param predicates
     * @returns {{key, label, values, range, allowMultiple}[]}
     */
    determineAdditionalEmptyProperties(metadata, predicates = []) {
        // Also add an entry for fields not yet entered
        const additionalProperties = predicates
            .filter(predicate => !Object.keys(metadata).includes(predicate['@id']))
            .map((predicate) => {
                const predicateUri = predicate['@id'];
                const vocabularyEntry = this.vocabularyById[predicateUri];
                return Vocabulary.generatePropertyEntry(predicateUri, [], vocabularyEntry);
            });

        return additionalProperties.sort(compareBy('label'));
    }

    /**
     * Groups the vocabulary by resource id
     *
     * @param vocabulary json-ld format where labels are specified.
     * @returns {*}
     */
    groupVocabularyById() {
        return this.vocabulary.reduce((vocabularyById, entry) => {
            vocabularyById[entry['@id']] = entry;
            return vocabularyById;
        }, {});
    }

    /**
     * Returns a list of predicates (objects from vocabulary) that is allowed for the given types of object
     * @param vocabulary
     * @param type
     */
    determinePredicatesForTypes(types) {
        return Array.from(new Set(
            types
                .map(type => this.determinePredicatesForType(type))
                .reduce((fullList, typeList) => fullList.concat(typeList), [])
        ));
    }

    /**
     * Returns a list of predicates (objects from vocabulary) that is allowed for the given type of object
     * @param vocabulary
     * @param type
     */
    determinePredicatesForType(type) {
        const isProperty = entry => entry['@type'].includes(constants.PROPERTY_URI);

        const isInDomain = entry => entry[constants.DOMAIN_URI] && entry[constants.DOMAIN_URI].find(domainEntry => domainEntry['@id'] === type);

        const predicates = this.vocabulary.filter(entry => isProperty(entry) && isInDomain(entry));
        return predicates;
    }

    convertTypeEntries(values) {
        return values
            .map(type => ({
                id: type,
                label: Vocabulary.getLabel(this.vocabularyById[type]),
                comment: Vocabulary.getComment(this.vocabularyById[type])
            }));
    }

    /**
     * Generates a list entry for a single property, with the values specified
     * @param predicate
     * @param values
     * @param vocabularyEntry
     * @returns {{key: string, label: string, values: [], range: string, allowMultiple: boolean}}
     * @private
     */
    static generatePropertyEntry(predicate, values, vocabularyEntry) {
        const label = Vocabulary.getLabel(vocabularyEntry);
        const range = Vocabulary.getFirstPredicateId(vocabularyEntry, constants.RANGE_URI);
        const allowMultiple = Vocabulary.getFirstPredicateValue(vocabularyEntry, constants.ALLOW_MULTIPLE_URI, false);
        const machineOnly = Vocabulary.getFirstPredicateValue(vocabularyEntry, constants.MACHINE_ONLY_URI, false);
        const multiLine = Vocabulary.getFirstPredicateValue(vocabularyEntry, constants.MULTILINE_PROPERTY_URI, false);
        const sortedValues = values.sort(comparing(compareBy('label'), compareBy('id'), compareBy('value')));

        return {
            key: predicate,
            label,
            values: sortedValues,
            range,
            allowMultiple,
            machineOnly,
            multiLine
        };
    }

    static getFirstPredicateValue(vocabularyEntry, predicate, defaultValue) {
        return this.getFirstPredicateProperty(vocabularyEntry, predicate, '@value', defaultValue);
    }

    static getFirstPredicateId(vocabularyEntry, predicate, defaultValue) {
        return this.getFirstPredicateProperty(vocabularyEntry, predicate, '@id', defaultValue);
    }

    static getFirstPredicateProperty(vocabularyEntry, predicate, property, defaultValue) {
        return vocabularyEntry && vocabularyEntry[predicate] && vocabularyEntry[predicate][0] ? vocabularyEntry[predicate][0][property] : defaultValue;
    }

    static getLabel(vocabularyEntry) {
        return this.getFirstPredicateValue(vocabularyEntry, constants.LABEL_URI, '');
    }

    static getComment(vocabularyEntry) {
        return this.getFirstPredicateValue(vocabularyEntry, constants.COMMENT_URI, '');
    }

    static lookupLabel(id, allMetadata) {
        const entry = allMetadata.find(element => element['@id'] === id);
        return Vocabulary.getFirstPredicateValue(entry, constants.LABEL_URI);
    }
}

export default Vocabulary;
