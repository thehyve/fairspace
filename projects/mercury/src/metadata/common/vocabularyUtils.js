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
export const isRelationShape = propertyShape => getFirstPredicateValue(propertyShape, constants.SHACL_CLASS) != null;

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
 * Returns a list of classes marked as fairspace entities.
 *
 * This is a list of entities that is not marked as machine-only, but does contain a targetClass predicate.
 * Deleted entries are excluded from the list
 */
export const getClassesInCatalog = (vocabulary) => vocabulary
    .filter(entry => getFirstPredicateId(entry, constants.SHACL_TARGET_CLASS) || (entry['@type'] && entry['@type'].includes(constants.RDFS_CLASS) && entry['@type'].includes(constants.SHACL_NODE_SHAPE)))
    .filter(entry => !getFirstPredicateValue(entry, constants.MACHINE_ONLY_URI))
    .filter(entry => !getFirstPredicateValue(entry, constants.DATE_DELETED_URI));

/**
 * Returns a list of classes marked as fairspace entities
 * @param namespaceFilter   Optional filter function on the jsonLD representation of the namespaces. By defaults passes everything
 * @returns {{isDefault: *, prefix: *, namespace: *, id: *, label: *}[]}
 */
export const getNamespaces = (vocabulary, namespaceFilter = () => true) => vocabulary
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
export const contains = (vocabulary, id) => vocabulary.some(el => el['@id'] === id);

/**
 * Returns the json-ld entry for the given identifier
 * @param id
 * @returns {object}
 */
export const getShape = (vocabulary, id) => vocabulary.find(el => el['@id'] === id) || {};

/**
 * Determines the SHACL shape to be applied to the given types
 * @param typeUris
 */
export const determineShapeForTypes = (vocabulary, typeUris) => vocabulary.find(entry => typeUris.includes(entry['@id']) || typeUris.includes(getFirstPredicateId(entry, constants.SHACL_TARGET_CLASS))) || {};

/**
 * Retrieve the SHACL shape for a type from the vocabulary,
 * and replaces the property references with full property
 * descriptors.
 * @param vocabulary
 * @param typeUris
 * @returns {null|*}
 */
export const typeShapeWithProperties = (vocabulary, typeUris) => {
    if (!typeUris || typeUris.length === 0) {
        return null;
    }
    const shape = vocabulary.find(def => def['@id'] === typeUris[0]);
    if (!shape) {
        return null;
    }
    shape[constants.SHACL_PROPERTY] = shape[constants.SHACL_PROPERTY].map(propertyRef => {
        const propertyId = propertyRef['@id'];
        return vocabulary.find(def => def['@id'] === propertyId);
    });
    if (shape[constants.SUBCLASS_URI]) {
        const superclassShape = typeShapeWithProperties(vocabulary, shape[constants.SUBCLASS_URI].map(ref => ref['@id']));
        shape[constants.SHACL_PROPERTY] = superclassShape[constants.SHACL_PROPERTY].concat(shape[constants.SHACL_PROPERTY]);
    }
    return shape;
};

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
export const determineShapeForProperty = (vocabulary, propertyUri) => vocabulary.find(
    entry => getFirstPredicateId(entry, constants.SHACL_PATH) === propertyUri
        && getFirstPredicateValue(entry, constants.SHACL_NAME)
);

/**
 * Returns a human readable label for the given type or the uri if no label is specified
 * @param typeUri
 * @returns {string}
 */
export const getLabelForType = (vocabulary: any[], typeUri: string) => {
    const typeShape = vocabulary.find(shape => shape['@id'] === typeUri);
    return getFirstPredicateValue(typeShape, constants.SHACL_NAME) || typeUri;
};

/**
 * Returns a list of property shapes that are in given node shape
 * @param shape
 */
const determinePropertyShapesForNodeShape = (vocabulary, shape) => {
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
export const determinePropertyShapesForTypes = (vocabulary, types) => determinePropertyShapesForNodeShape(vocabulary, determineShapeForTypes(vocabulary, types));

/**
 * Returns a list of property shapes for the given type, where the properties are marked as fs:importantProperty
 * @param type
 */
export const determineImportantPropertyShapes = (vocabulary, type) => determinePropertyShapesForTypes(vocabulary, [type])
    .filter(shape => getFirstPredicateValue(shape, constants.IMPORTANT_PROPERTY_URI, false));

/**
 * Generates a list entry for a single property
 * @param predicate
 * @param shape
 * @returns {{key: string, label: string, datatype: string, className: string, maxValuesCount: number, machineOnly: boolean, multiLine: boolean}}
 * @private
 */
const generatePropertyEntry = (vocabulary, predicate, shape) => {
    const datatype = getFirstPredicateId(shape, constants.SHACL_DATATYPE);
    const className = getFirstPredicateId(shape, constants.SHACL_CLASS);
    const multiLine = (datatype === constants.STRING_URI && !getFirstPredicateValue(shape, constants.DASH_SINGLE_LINE, false)) || datatype === constants.MARKDOWN_URI;
    const description = getFirstPredicateValue(shape, constants.SHACL_DESCRIPTION);
    const path = getFirstPredicateId(shape, constants.SHACL_PATH);
    const shapeIsRelationShape = isRelationShape(shape);
    const importantPropertyShapes = shapeIsRelationShape && className ? determineImportantPropertyShapes(vocabulary, className) : [];

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
        allowAdditionOfEntities: false,
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
 *      key: "https://fairspace.nl/ontology#description",
 *      label: "Description",
 *      ...
 *  }
 * @see {generatePropertyEntry}
 */
export const getProperties = (vocabulary, propertyShapes) => {
    if (!propertyShapes) {
        return [];
    }

    const properties = propertyShapes
        .map(shape => {
            const predicateUri = getFirstPredicateId(shape, constants.SHACL_PATH);
            return generatePropertyEntry(vocabulary, predicateUri, shape);
        });

    return [...properties, TYPE_PROPERTY];
};

/**
 * Returns a list of properties for a certain shape to be used for form building
 * @param nodeShape
 * @returns {Array}
 * @see {getProperties}
 */
export const getPropertiesForNodeShape = (vocabulary, nodeShape) => {
    const propertyShapes = determinePropertyShapesForNodeShape(vocabulary, nodeShape);
    return getProperties(vocabulary, propertyShapes);
};

export const getChildSubclasses = (vocabulary, type) => vocabulary.filter(e => getFirstPredicateId(e, constants.SUBCLASS_URI) === type).map(e => e['@id']);

/**
 * Returns an array of the types that are subclasses of the provided type including indirect subclasses
 * @param {string} type
 */
export const getDescendants = (vocabulary, type) => {
    let queue = [type];
    let found = [];

    while (queue.length > 0) {
        const head = queue.shift();
        const subClasses = getChildSubclasses(vocabulary, head);
        queue = queue.concat(subClasses);
        found = found.concat(subClasses);
    }

    return found;
};
