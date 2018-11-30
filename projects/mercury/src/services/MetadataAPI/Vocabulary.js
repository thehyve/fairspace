import {compareBy, comparing} from "../../utils/comparators";
import {
    ALLOW_MULTIPLE_URI,
    MACHINE_ONLY_URI,
    CLASS_URI,
    DOMAIN_URI,
    FAIRSPACE_ENTITY_URI,
    LABEL_URI,
    COMMENT_URI,
    MULTILINE_PROPERTY_URI,
    PROPERTY_URI,
    RANGE_URI
} from "./MetadataAPI";
import {getSingleValue} from "../../utils/metadatautils";

class Vocabulary {
    /**
     * Stores the vocabulary
     * @param vocabulary    Expanded version of the vocabulary to use
     */
    constructor(vocabulary) {
        this.vocabulary = vocabulary;

        // Cache a version of the vocabulary by id, to do easy lookups
        this.vocabularyById = this._groupVocabularyById();
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
        let metadataItem;
        if(!subject) {
            subject = expandedMetadata[0]['@id'];
            metadataItem = expandedMetadata[0];
        } else {
            metadataItem = expandedMetadata.find(item => item['@id'] === subject);
        }

        // Retrieve the metadata item for this subject
        if (!Array.isArray(metadataItem['@type'])) {
            console.warn("Can not combine metadata without a type or that is not expanded");
            return [];
        }

        // Determine properties allowed for the given type
        const typePredicates = this._determinePredicatesForTypes(metadataItem['@type']);

        // Actually convert the metadata into a list of properties
        const properties = this._convertMetadataIntoPropertyList(metadataItem, typePredicates, expandedMetadata);
        const emptyProperties = this._determineAdditionalEmptyProperties(metadataItem, typePredicates);

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
            .filter(entry => entry['@type'].includes(CLASS_URI) && getSingleValue(entry, FAIRSPACE_ENTITY_URI))
    }

    /**
     * Converts a JSON-LD structure into a list of properties and values
     * @param metadata Expanded JSON-LD metadata about a single subject. The subject must have a '@type' property
     * @param predicates List of predicates that should be included
     * @returns {Array}
     */
    _convertMetadataIntoPropertyList(metadata, predicates = [], allMetadata = []) {
        const prefilledProperties = [];

        // Add the metadata already available
        for (const predicateUri in metadata) {
            // Skip this predicate if it is not allowed for the current type
            if (predicateUri !== "@type" && !predicates.find(predicate => predicate['@id'] === predicateUri)) {
                continue;
            }

            // Skip this predicate if it is not in the vocabulary
            const vocabularyEntry = this.vocabularyById[predicateUri];

            if (predicateUri !== "@type" && !vocabularyEntry) {
                continue;
            }

            // Ensure that we have a list of values for the predicate
            if (!Array.isArray(metadata[predicateUri])) {
                console.warn("Metadata should be provided in expanded form");
                continue;
            }

            let values = (predicateUri === "@type")
                // @type needs special attention: it is specified as a literal string
                // but should be treated as an object
                ? this._convertTypeEntries(metadata[predicateUri])
                : metadata[predicateUri].map(i => ({
                    id: i['@id'],
                    value: i['@value'],
                    label: Vocabulary._lookupLabel(i['@id'], allMetadata)
                }));

            prefilledProperties.push(Vocabulary._generatePropertyEntry(predicateUri, values, vocabularyEntry));
        }

        return prefilledProperties.sort(compareBy('label'));
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

        return additionalProperties.sort(compareBy('label'));
    }

    /**
     * Groups the vocabulary by resource id
     *
     * @param vocabulary json-ld format where labels are specified.
     * @returns {*}
     */
    _groupVocabularyById() {
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
    _determinePredicatesForTypes(types) {
        return Array.from(new Set(
            types
                .map(type => this._determinePredicatesForType(type))
                .reduce((fullList, typeList) => fullList.concat(typeList), [])
        ));
    }

    /**
     * Returns a list of predicates (objects from vocabulary) that is allowed for the given type of object
     * @param vocabulary
     * @param type
     */
    _determinePredicatesForType(type) {
        const isProperty = entry =>
            entry['@type'].includes(PROPERTY_URI);

        const isInDomain = entry => {
            return entry[DOMAIN_URI] && entry[DOMAIN_URI].find(domainEntry => domainEntry['@id'] === type);
        }

        const predicates = this.vocabulary.filter(entry => isProperty(entry) && isInDomain(entry));
        return predicates;
    }

    _convertTypeEntries(values) {
        return values
            .map(type => ({
                id: type,
                label: Vocabulary._getLabel(this.vocabularyById[type]),
                comment: Vocabulary._getComment(this.vocabularyById[type])
            }))
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
        const label = Vocabulary._getLabel(vocabularyEntry);
        const range = Vocabulary._getFirstPredicateId(vocabularyEntry, RANGE_URI);
        const allowMultiple = Vocabulary._getFirstPredicateValue(vocabularyEntry, ALLOW_MULTIPLE_URI, false);
        const machineOnly = Vocabulary._getFirstPredicateValue(vocabularyEntry, MACHINE_ONLY_URI, false);
        const multiLine = Vocabulary._getFirstPredicateValue(vocabularyEntry, MULTILINE_PROPERTY_URI, false);
        const sortedValues = values.sort(comparing(compareBy('label'), compareBy('id'), compareBy('value')));

        return {
            key: predicate,
            label: label,
            values: sortedValues,
            range: range,
            allowMultiple: allowMultiple,
            machineOnly: machineOnly,
            multiLine: multiLine
        };
    }

    static _getFirstPredicateValue(vocabularyEntry, predicate, defaultValue) {
        return this._getFirstPredicateProperty(vocabularyEntry, predicate, '@value', defaultValue);
    }

    static _getFirstPredicateId(vocabularyEntry, predicate, defaultValue) {
        return this._getFirstPredicateProperty(vocabularyEntry, predicate, '@id', defaultValue);
    }

    static _getFirstPredicateProperty(vocabularyEntry, predicate, property, defaultValue) {
        return vocabularyEntry && vocabularyEntry[predicate] && vocabularyEntry[predicate][0] ? vocabularyEntry[predicate][0][property] : defaultValue;
    }

    static _getLabel(vocabularyEntry) {
        return this._getFirstPredicateValue(vocabularyEntry, LABEL_URI, '');
    }

    static _getComment(vocabularyEntry) {
        return this._getFirstPredicateValue(vocabularyEntry, COMMENT_URI, '');
    }

    static _lookupLabel(id, allMetadata) {
        const entry = allMetadata.find(element => element['@id'] === id);
        return Vocabulary._getFirstPredicateValue(entry, LABEL_URI)
    }
}

export default Vocabulary;
