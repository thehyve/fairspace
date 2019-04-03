import {compareBy, comparing} from "../utils/comparisionUtils";
import * as constants from "../constants";
import {getFirstPredicateId, getFirstPredicateList, getFirstPredicateValue, getLabel} from "../utils/metadataUtils";
import {flattenShallow} from "../utils/arrayUtils";

class Vocabulary {
    /**
     * Stores the vocabulary
     * @param vocabulary    Expanded version of the vocabulary to use
     */
    constructor(vocabulary) {
        this.vocabulary = vocabulary;
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
     * @returns [Any] A promise resolving in an array with metadata. Each element will look like this:
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
        const propertyShapes = this.determinePropertyShapesForTypes(metadataItem['@type']);

        // Actually convert the metadata into a list of properties
        const properties = this.convertMetadataIntoPropertyList(metadataItem, propertyShapes, expandedMetadata);
        const emptyProperties = this.determineAdditionalEmptyProperties(metadataItem, propertyShapes);

        // An entry with information on the type is returned as well for display purposes
        const typeProperty = this.generateTypeProperty(metadataItem['@type']);

        return [...properties, ...emptyProperties, typeProperty];
    }

    /**
     * Looks up an entity shape in the vocabulary for the given type
     * @param type
     */
    getById(type) {
        return this.determineShapeForType(type) || {};
    }

    /**
     * Returns a list of classes marked as fairspace entities
     */
    getFairspaceClasses() {
        return this.vocabulary
            .filter(entry => getFirstPredicateValue(entry, constants.SHOW_IN_CATALOG_URI));
    }

    /**
     * Returns a human readable label for the given predicate or the uri if no label is specified
     * @param uri
     * @returns {string}
     */
    getLabelForPredicate(uri) {
        return getFirstPredicateValue(this.determineShapeForProperty(uri), constants.SHACL_NAME) || uri;
    }

    /**
     * Converts a JSON-LD structure into a list of properties and values
     * @param metadata Expanded JSON-LD metadata about a single subject. The subject must have a '@type' property
     * @param propertyShapes List of propertyShapes that should be included
     * @param allMetadata All known metadata to be processed. Is used to retrieve labels for associated entities
     * @returns {Array}
     */
    convertMetadataIntoPropertyList(metadata, propertyShapes = [], allMetadata = []) {
        const prefilledProperties = [];

        Object.keys(metadata)
            .forEach(predicateUri => {
                const propertyShape = propertyShapes
                    .find(shape => getFirstPredicateId(shape, constants.SHACL_PATH) === predicateUri);

                if (!propertyShape) {
                    return;
                }

                // Ensure that we have a list of values for the predicate
                if (!Array.isArray(metadata[predicateUri])) {
                    console.warn("Metadata should be provided in expanded form");
                    return;
                }

                let values;
                if (getFirstPredicateId(propertyShape, constants.SHACL_CLASS) === constants.LIST_URI) {
                    // RDF lists in JSON LD are arrays in a container with key '@list'
                    // We want to use just the arrays. If there are multiple lists
                    // they are concatenated
                    // Please note that entries are not sorted as rdf:lists are meant to be ordered
                    values = flattenShallow(metadata[predicateUri].map(
                        entry => (entry['@list'] ? entry['@list'] : [entry])
                    )).map(entry => Vocabulary.generateValueEntry(entry, allMetadata));
                } else {
                    // Convert json-ld values into our internal format and
                    // sort the values
                    values = metadata[predicateUri]
                        .map(entry => Vocabulary.generateValueEntry(entry, allMetadata))
                        .sort(comparing(compareBy('label'), compareBy('id'), compareBy('value')));
                }

                prefilledProperties.push(Vocabulary.generatePropertyEntry(predicateUri, values, propertyShape));
            });

        return prefilledProperties.sort(compareBy('label'));
    }

    /**
     * Determines a list of properties for which no value is present in the metadata
     * @param metadata
     * @param propertyShapes
     * @returns {{key, label, values, range, allowMultiple}[]}
     */
    determineAdditionalEmptyProperties(metadata, propertyShapes = []) {
        // Also add an entry for fields not yet entered
        const additionalProperties = propertyShapes
            .filter(shape => !Object.keys(metadata).includes(getFirstPredicateId(shape, constants.SHACL_PATH)))
            .map((shape) => {
                const predicateUri = getFirstPredicateId(shape, constants.SHACL_PATH);
                return Vocabulary.generatePropertyEntry(predicateUri, [], shape);
            });

        return additionalProperties.sort(compareBy('label'));
    }

    /**
     * Returns a list of property shapes that are in the shape of the given types
     * @param types
     */
    determinePropertyShapesForTypes(types) {
        return Array.from(new Set(
            types
                .map(type => this.determinePropertyShapesForType(type))
                .reduce((fullList, typeList) => fullList.concat(typeList), [])
        ));
    }

    /**
     * Determines the SHACL shape to be applied to the given type
     * @param typeUri
     */
    determineShapeForType(typeUri) {
        return this.vocabulary
            .find(entry => getFirstPredicateId(entry, constants.SHACL_TARGET_CLASS) === typeUri);
    }

    /**
     * Determines the SHACL shape to be applied to the given type
     * @param propertyUri
     */
    determineShapeForProperty(propertyUri) {
        return this.vocabulary
            .find(entry => getFirstPredicateId(entry, constants.SHACL_PATH) === propertyUri);
    }

    /**
     * Returns a list of property shapes that are in the shape of the given type
     * @param type
     */
    determinePropertyShapesForType(type) {
        const shape = this.determineShapeForType(type);

        if (!shape) {
            return [];
        }

        const propertyShapes = shape[constants.SHACL_PROPERTY];
        const propertyShapeIds = propertyShapes ? propertyShapes.map(propertyShape => propertyShape['@id']) : [];

        return this.vocabulary
            .filter(entry => propertyShapeIds.includes(entry['@id']));
    }

    /**
     * Generates a property entry for the given type(s)
     * @param types  Array of uris of the type of an entity
     * @returns {{allowMultiple: boolean, values: *, label: string, key: string, machineOnly: boolean}}
     */
    generateTypeProperty(types) {
        const typeValues = types.map(type => {
            const shape = this.determineShapeForType(type);
            return {
                id: type,
                label: getFirstPredicateValue(shape, constants.SHACL_NAME, type),
                comment: getFirstPredicateValue(shape, constants.SHACL_DESCRIPTION, type)
            };
        });

        return {
            key: '@type',
            label: 'Type',
            values: typeValues,
            allowMultiple: false,
            machineOnly: true
        };
    }

    /**
     * Generates a list entry for a single property, with the values specified
     * @param predicate
     * @param values
     * @param propertyShape
     * @returns {{key: string, label: string, values: [], datatype: string, className: string, allowMultiple: boolean, machineOnly: boolean, multiLine: boolean}}
     * @private
     */
    static generatePropertyEntry(predicate, values, propertyShape) {
        const label = getFirstPredicateValue(propertyShape, constants.SHACL_NAME);
        const datatype = getFirstPredicateId(propertyShape, constants.SHACL_DATATYPE);
        const className = getFirstPredicateId(propertyShape, constants.SHACL_CLASS);
        const allowMultiple = getFirstPredicateValue(propertyShape, constants.SHACL_MAX_COUNT, 1000) > 1;
        const machineOnly = getFirstPredicateValue(propertyShape, constants.MACHINE_ONLY_URI, false);
        const multiLine = datatype === constants.STRING_URI && getFirstPredicateValue(propertyShape, constants.SHACL_MAX_LENGTH, 1000) > 255;
        const allowedValues = getFirstPredicateList(propertyShape, constants.SHACL_IN, undefined);

        return {
            key: predicate,
            label,
            values,
            datatype,
            className,
            allowMultiple,
            machineOnly,
            multiLine,
            allowedValues
        };
    }

    /**
     * Generates an entry to describe a single value for a property
     * @param entry
     * @param allMetadata
     * @returns {{id: *, label, value: *}}
     */
    static generateValueEntry(entry, allMetadata) {
        return {
            id: entry['@id'],
            value: entry['@value'],
            label: Vocabulary.lookupLabel(entry['@id'], allMetadata)
        };
    }

    static lookupLabel(id, allMetadata) {
        const entry = allMetadata.find(element => element['@id'] === id);
        return getLabel(entry);
    }
}

export default Vocabulary;
