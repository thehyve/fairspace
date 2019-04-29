import * as constants from "../../constants";
import {getFirstPredicateId, getFirstPredicateList, getFirstPredicateValue} from "./jsonLdUtils";

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

export const vocabularyUtils = (vocabulary = []) => {
    /**
     * Returns a list of classes marked as fairspace entities
     */
    const getClassesInCatalog = () => vocabulary.filter(entry => getFirstPredicateValue(entry, constants.SHOW_IN_CATALOG_URI));

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
     * Determines the SHACL shape to be applied to the given type
     * @param typeUri
     */
    const determineShapeForType = (typeUri) => vocabulary.find(entry => getFirstPredicateId(entry, constants.SHACL_TARGET_CLASS) === typeUri) || {};

    /**
     * Determines the SHACL shape to be applied to the given type
     * @param propertyUri
     */
    const determineShapeForProperty = (propertyUri) => vocabulary.find(entry => getFirstPredicateId(entry, constants.SHACL_PATH) === propertyUri);

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
     * Returns a list of property shapes that are in the shape of the given type
     * @param type
     */
    const determinePropertyShapesForType = (type) => determinePropertyShapesForNodeShape(determineShapeForType(type));

    /**
     * Returns a list of property shapes that are in the shape of the given types
     * @param types
     */
    const determinePropertyShapesForTypes = (types) => Array.from(new Set(
        types
            .map(type => determinePropertyShapesForType(type))
            .reduce((fullList, typeList) => fullList.concat(typeList), [])
    ));

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
     * @param values
     * @param shape
     * @returns {{key: string, label: string, datatype: string, className: string, maxValuesCount: number, machineOnly: boolean, multiLine: boolean}}
     * @private
     */
    const generatePropertyEntry = (predicate, shape) => {
        const datatype = getFirstPredicateId(shape, constants.SHACL_DATATYPE);
        const className = getFirstPredicateId(shape, constants.SHACL_CLASS);
        const multiLine = datatype === constants.STRING_URI && getFirstPredicateValue(shape, constants.SHACL_MAX_LENGTH, 1000) > 255;
        const minValuesCount = getFirstPredicateValue(shape, constants.SHACL_MIN_COUNT);

        return {
            key: predicate,
            label: getFirstPredicateValue(shape, constants.SHACL_NAME),
            shape,
            datatype,
            multiLine,
            className,
            minValuesCount,
            maxValuesCount: getFirstPredicateValue(shape, constants.SHACL_MAX_COUNT),
            machineOnly: getFirstPredicateValue(shape, constants.MACHINE_ONLY_URI, false),
            allowedValues: getFirstPredicateList(shape, constants.SHACL_IN),
            isRdfList: isRdfList(shape),
            isGenericIriResource: isGenericIriResource(shape),
            allowAdditionOfEntities: isFairspaceClass(className)
        };
    };

    /**
     * @returns {array}     The vocabulary in json-ld format
     */
    const getRaw = () => vocabulary;

    return Object.freeze({
        contains,
        get,
        determineShapeForProperty,
        determineShapeForType,
        determinePropertyShapesForTypes,
        determinePropertyShapesForNodeShape,
        generatePropertyEntry,
        getRaw,
        getLabelForPredicate,
        getClassesInCatalog
    });
};
