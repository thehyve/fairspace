import * as constants from "../../constants";
import {getFirstPredicateId, getFirstPredicateList, getFirstPredicateValue} from "./jsonLdUtils";

const TYPE_PROPERTY = {
    key: '@type',
    label: 'Type',
    maxValuesCount: 1,
    machineOnly: true,
};

/**
 * Checks whether the given shape describes an RDF list
 * @param propertyShape
 * @returns {boolean}
 */
export const isRdfList = (propertyShape) => getFirstPredicateId(propertyShape, constants.SHACL_NODE) === constants.DASH_LIST_SHAPE;

/**
 * Checks whether the given shape represents a generic IRI resource
 * @param propertyShape
 * @returns {boolean}
 */
export const isGenericIriResource = (propertyShape) => getFirstPredicateId(propertyShape, constants.SHACL_NODEKIND) === constants.SHACL_IRI;

/**
 * Checks whether the given shape describe a relation
 * @param propertyShape
 * @returns {boolean}
 */
export const isRelationShape = propertyShape => Array.isArray(propertyShape['@type']) && propertyShape['@type'].includes(constants.RELATION_SHAPE_URI);

/**
 * Returns the maxCount value for the given shape
 *
 * RDF lists are treated as a special case. They have a maxCount of 1, because
 * they (mostly) support only a single list. However, our UI and validation should
 * treat it as if multiple values are allowed.
 *
 * @param propertyShape
 * @returns {number}
 */
export const getMaxCount = propertyShape => (isRdfList(propertyShape) ? 0 : getFirstPredicateValue(propertyShape, constants.SHACL_MAX_COUNT));

/**
 * Checks whether the given shape represents an external link (specified by fs:externalLink)
 * @param propertyShape
 * @returns {boolean}
 */
const isExternalLink = propertyShape => !!getFirstPredicateValue(propertyShape, constants.EXTERNAL_LINK_URI, false);

/**
 * Checks whether the given list of properties represents a fixed shape, as defined by FS:fixedShape
 */
export const isFixedShape = classShape => getFirstPredicateValue(classShape, constants.FIXED_SHAPE_URI, false);

/**
 * Returns a list of system properties defined for the given shape
 */
export const getSystemProperties = classShape => (classShape && classShape[constants.SYSTEM_PROPERTIES_URI] && classShape[constants.SYSTEM_PROPERTIES_URI].map(entry => entry['@id'])) || [];

/**
 * Extends the list of properties with information for vocabulary editing
 *
 * The logic that is applied is based on the functionality of the fs:fixedShape flag. This flag
 * indicates that a user is not allowed to change anything from a shape, except for adding
 * new properties. The user is also allowed to delete properties that have been added before
 * (i.e. not systemProperties)
 *
 * The following keys are added to the properties:
 * - editable           is set based on the given editable flag combined with the isFixed flag
 * - systemProperties   is set for the field SHACL_PROPERTY
 *
 * @param properties
 * @param editable
 * @param isFixed
 * @param systemProperties
 * @returns {*}
 */
export const extendPropertiesWithVocabularyEditingInfo = ({properties, isEditable = true, isFixed = false, systemProperties = []}) => properties
    .map(p => {
        // For fixed shapes, return the list of system properties for the SHACL_PROPERTY definition
        if (isFixed && p.key === constants.SHACL_PROPERTY) {
            // Add systemProperties for determining which entry can be deleted
            return {...p, isEditable: isEditable && !p.machineOnly, systemProperties};
        }

        // In all other cases, if the shape is fixed, the property must not be editable
        return {
            ...p,
            isEditable: !isFixed && isEditable
        };
    });

export const vocabularyUtils = (vocabulary = []) => {
    /**
     * Returns a list of classes marked as fairspace entities.
     *
     * This is a list of entities that is not marked as machine-only, but does contain a targetClass predicate
     */
    const getClassesInCatalog = () => vocabulary.filter(entry => getFirstPredicateId(entry, constants.SHACL_TARGET_CLASS) && !getFirstPredicateValue(entry, constants.MACHINE_ONLY_URI));

    /**
     * Returns a list of classes marked as fairspace entities
     * @param namespaceFilter   Optional filter function on the jsonLD representation of the namespaces. By defaults passes everything
     * @returns {{isDefault: *, prefix: *, namespace: *, id: *, label: *}[]}
     */
    const getNamespaces = (namespaceFilter = () => true) => vocabulary
        .filter(entry => entry['@type'] && entry['@type'].includes(constants.SHACL_PREFIX_DECLARATION))
        .filter(namespaceFilter)
        .map(namespace => ({
            id: namespace['@id'],
            label: getFirstPredicateValue(namespace, constants.SHACL_NAME),
            prefix: getFirstPredicateValue(namespace, constants.SHACL_PREFIX),
            namespace: getFirstPredicateId(namespace, constants.SHACL_NAMESPACE),
            isDefault: getFirstPredicateValue(namespace, constants.DEFAULT_NAMESPACE_URI, false)
        }));

    /**
     * Checks whether the vocabulary contains the given identifier
     * @param id
     * @returns {boolean}
     */
    const contains = (id) => vocabulary.some(el => el['@id'] === id);

    /**
     * Returns the json-ld entry for the given identifier
     * @param id
     * @returns {array}
     */
    const get = (id) => vocabulary.find(el => el['@id'] === id) || [];

    /**
     * Determines the SHACL shape to be applied to the given types
     * @param typeUris
     */
    const determineShapeForTypes = (typeUris) => vocabulary.find(entry => typeUris.includes(getFirstPredicateId(entry, constants.SHACL_TARGET_CLASS))) || {};

    /**
     * Determines the SHACL shape to be applied to the given type.
     *
     * This method filters out any node that does not have a required SHACL name. This avoid an issue where
     * there could be a blank node in the vocabulary referring the same sh:path, but only used to define a required field.
     *
     * See VRE-752 for more details
     *
     * @param propertyUri
     */
    const determineShapeForProperty = (propertyUri) => vocabulary.find(
        entry => getFirstPredicateId(entry, constants.SHACL_PATH) === propertyUri
            && getFirstPredicateValue(entry, constants.SHACL_NAME)
    );

    /**
     * Returns a human readable label for the given predicate or the uri if no label is specified
     * @param uri
     * @returns {string}
     */
    const getLabelForPredicate = (uri) => getFirstPredicateValue(determineShapeForProperty(uri), constants.SHACL_NAME) || uri;

    /**
     * Returns a list of property shapes that are in given node shape
     * @param shape
     */
    const determinePropertyShapesForNodeShape = (shape) => {
        if (!shape) {
            return [];
        }

        const propertyShapes = shape[constants.SHACL_PROPERTY];
        const propertyShapeIds = propertyShapes ? propertyShapes.map(propertyShape => propertyShape['@id']) : [];

        return vocabulary
            .filter(entry => propertyShapeIds.includes(entry['@id']));
    };

    /**
     * Returns a list of property shapes that are in the shape of the given types
     * @param types
     */
    const determinePropertyShapesForTypes = (types) => determinePropertyShapesForNodeShape(determineShapeForTypes(types));

    /**
     * Returns a list of property shapes for the given type, where the properties are marked as fs:importantProperty
     * @param type
     */
    const determineImportantPropertyShapes = type => determinePropertyShapesForTypes([type])
        .filter(shape => getFirstPredicateValue(shape, constants.IMPORTANT_PROPERTY_URI, false));

    /**
     * Determines whether the given class URI is a fairspace class
     */
    const isFairspaceClass = (className) => {
        if (!className) {
            return false;
        }

        return getClassesInCatalog(vocabulary)
            .some(entry => getFirstPredicateId(entry, constants.SHACL_TARGET_CLASS) === className);
    };

    /**
     * Generates a list entry for a single property
     * @param predicate
     * @param shape
     * @returns {{key: string, label: string, datatype: string, className: string, maxValuesCount: number, machineOnly: boolean, multiLine: boolean}}
     * @private
     */
    const generatePropertyEntry = (predicate, shape) => {
        const datatype = getFirstPredicateId(shape, constants.SHACL_DATATYPE);
        const className = getFirstPredicateId(shape, constants.SHACL_CLASS);
        const multiLine = datatype === constants.STRING_URI && !getFirstPredicateValue(shape, constants.DASH_SINGLE_LINE, false);
        const description = getFirstPredicateValue(shape, constants.SHACL_DESCRIPTION);
        const path = getFirstPredicateId(shape, constants.SHACL_PATH);
        const shapeIsRelationShape = isRelationShape(shape);
        const importantPropertyShapes = shapeIsRelationShape && className ? determineImportantPropertyShapes(className) : [];

        return {
            key: predicate,
            label: getFirstPredicateValue(shape, constants.SHACL_NAME),
            description,
            path,
            shape,
            datatype,
            multiLine,
            className,
            order: getFirstPredicateValue(shape, constants.SHACL_ORDER),
            minValuesCount: getFirstPredicateValue(shape, constants.SHACL_MIN_COUNT),
            maxValuesCount: getMaxCount(shape),
            machineOnly: getFirstPredicateValue(shape, constants.MACHINE_ONLY_URI, false),
            isRdfList: isRdfList(shape),
            allowedValues: getFirstPredicateList(shape, constants.SHACL_IN),
            isGenericIriResource: isGenericIriResource(shape),
            isExternalLink: isExternalLink(shape),
            allowAdditionOfEntities: isFairspaceClass(className),
            isRelationShape: shapeIsRelationShape,
            importantPropertyShapes
        };
    };

    /**
     * Converts the propertyshapes into a list of properties to be used for form building
     *
     * Please note that only the metadata for the first subject will be used
     *
     * @param propertyShapes    List of propertyshapes that apply to a certain entity
     * @returns {array}         A list of properties that can be used to show a form. The format is similar to this
     * {
     *      key: "http://fairspace.io/ontology#description",
     *      label: "Description",
     *      ...
     *  }
     * @see {generatePropertyEntry}
     */
    const getProperties = (propertyShapes) => {
        if (!propertyShapes) {
            return [];
        }

        const properties = propertyShapes
            .map(shape => {
                const predicateUri = getFirstPredicateId(shape, constants.SHACL_PATH);
                return generatePropertyEntry(predicateUri, shape);
            });

        return [...properties, TYPE_PROPERTY];
    };

    /**
     * Returns a list of properties for a certain shape to be used for form building
     * @param nodeShape
     * @returns {Array}
     * @see {getProperties}
     */
    const getPropertiesForNodeShape = (nodeShape) => {
        const propertyShapes = determinePropertyShapesForNodeShape(nodeShape);
        return getProperties(propertyShapes, vocabulary);
    };

    /**
     * @returns {array}     The vocabulary in json-ld format
     */
    const getRaw = () => vocabulary;

    const getChildSubclasses = type => vocabulary.filter(e => getFirstPredicateId(e, constants.SUBCLASS_URI) === type).map(e => e['@id']);

    /**
     * Returns an array of the types that are subclasses of the provided type including indirect subclasses
     * @param {string} type
     */
    const getDescendants = type => {
        let queue = [type];
        let found = [];

        while (queue.length > 0) {
            const head = queue.shift();
            const subClasses = getChildSubclasses(head);
            queue = queue.concat(subClasses);
            found = found.concat(subClasses);
        }

        return found;
    };

    return Object.freeze({
        contains,
        get,
        determineShapeForProperty,
        determineShapeForTypes,
        determinePropertyShapesForTypes,
        determinePropertyShapesForNodeShape,

        getProperties,
        getPropertiesForNodeShape,

        getRaw,
        getLabelForPredicate,
        getClassesInCatalog,
        getNamespaces,
        getChildSubclasses,
        getDescendants,

    });
};
