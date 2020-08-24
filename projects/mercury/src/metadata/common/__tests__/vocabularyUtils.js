import {
    contains,
    determinePropertyShapesForTypes,
    determineShapeForProperty,
    getChildSubclasses,
    getClassesInCatalog,
    getDescendants,
    getLabelForPredicate,
    getMaxCount,
    getNamespaces,
    getProperties,
    getSystemProperties,
    isGenericIriResource,
    isRdfList,
    isRelationShape,
} from '../vocabularyUtils';
import vocabularyJsonLd from './test.vocabulary.json';
import * as constants from "../../../constants";
import {getFirstPredicateId} from "../jsonLdUtils";

describe('getLabelForPredicate', () => {
    it('returns the label for a known predicate', () => {
        expect(getLabelForPredicate(vocabularyJsonLd, 'http://www.w3.org/2000/01/rdf-schema#label')).toEqual('Label');
    });

    it('returns the uri if no label is known for a predicate', () => {
        const uri = 'http://fairspace.io/ontology#Unknown';
        expect(getLabelForPredicate(vocabularyJsonLd, uri)).toEqual(uri);
    });

    it('returns the uri if the predicate itself is unknown', () => {
        const uri = 'http://fairspace.io/ontology#NonExisting';
        expect(getLabelForPredicate(vocabularyJsonLd, uri)).toEqual(uri);
    });
});

describe('determineShapeForProperty', () => {
    it('returns the correct shape given a url', () => {
        expect(determineShapeForProperty(vocabularyJsonLd, 'http://www.w3.org/2000/01/rdf-schema#comment')['@id']).toEqual('http://www.w3.org/2000/01/rdf-schema#commentShape');
    });
    it('returns the correct shape if there is also a blank node pointing to it', () => {
        expect(determineShapeForProperty(vocabularyJsonLd, 'http://fairspace.io/ontology#list')['@id']).toEqual('http://fairspace.io/ontology#listShape');
    });

    it('is undefined if there is only a blank node for a property', () => {
        expect(determineShapeForProperty(vocabularyJsonLd, 'http://fairspace.io/ontology#only-blank')).toBe(undefined);
    });
});

describe('vocabulary contains', () => {
    it('should return true if the given id is present in the vocabulary', () => expect(contains(vocabularyJsonLd, vocabularyJsonLd[0]['@id'])).toBe(true));
    it('should return false if the given id is not present in the vocabulary', () => expect(contains(vocabularyJsonLd, 'http://not-present')).toBe(false));
    it('should return false on empty vocabulary', () => expect(contains([], vocabularyJsonLd[0]['@id'])).toBe(false));
    it('should return false on invalid URI', () => expect(contains(vocabularyJsonLd, 'invalid-uri')).toBe(false));
    it('should return false on invalid parameter', () => expect(contains(vocabularyJsonLd)).toBe(false));
    it('should return false if URI is only referred to in vocabulary', () => expect(contains(vocabularyJsonLd, 'http://fairspace.io/ontology#Collection')).toBe(false));
});

describe('isRdfList', () => {
    const rdfListShape = {
        [constants.SHACL_NODE]: [{'@id': constants.DASH_LIST_SHAPE}]
    };

    const nonRdfListShape = {
        [constants.SHACL_DATATYPE]: [{'@id': constants.STRING_URI}]
    };

    it('should return true if the given shape is an rdf list', () => expect(isRdfList(rdfListShape)).toBe(true));
    it('should return false if the given shape is not an rdf list', () => expect(isRdfList(nonRdfListShape)).toBe(false));
    it('should return false on an empty shape', () => expect(isRdfList({})).toBe(false));
});

describe('getMaxCount', () => {
    const rdfListShape = {
        [constants.SHACL_NODE]: [{'@id': constants.DASH_LIST_SHAPE}],
        [constants.SHACL_MAX_COUNT]: [{'@value': 1}]
    };

    const nonRdfListShape = {
        [constants.SHACL_DATATYPE]: [{'@id': constants.STRING_URI}],
        [constants.SHACL_MAX_COUNT]: [{'@value': 10}]
    };

    it('should return the max count value for a non list property', () => expect(getMaxCount(nonRdfListShape)).toEqual(10));
    it('should be falsy for an RDF list, regardless of its value', () => expect(getMaxCount(rdfListShape)).toBeFalsy());
});

describe('isGenericResourceIri', () => {
    const genericResourceShape = {
        [constants.SHACL_NODEKIND]: [{'@id': constants.SHACL_IRI}]
    };

    const nonGenericResourceShape = {
        [constants.SHACL_NODEKIND]: [{'@id': constants.STRING_URI}]
    };

    it('should return true if the given shape represents a generic iri resource', () => expect(isGenericIriResource(genericResourceShape)).toBe(true));
    it('should return false if the given shape does not represent a generic iri resource', () => expect(isGenericIriResource(nonGenericResourceShape)).toBe(false));
    it('should return false on an empty shape', () => expect(isGenericIriResource({})).toBe(false));
});

describe('getSystemProperties', () => {
    const emptyShape = {};
    const emptyList = {
        [constants.SYSTEM_PROPERTIES_URI]: []
    };
    const systemPropertiesList = {
        [constants.SYSTEM_PROPERTIES_URI]: [{'@id': 'http://a'}, {'@id': 'http://b'}]
    };

    it('should return an empty list if no system properties are present', () => expect(getSystemProperties(emptyShape)).toEqual([]));
    it('should return an empty list if the system properties list is empty', () => expect(getSystemProperties(emptyList)).toEqual([]));
    it('should return a list with iris if no system properties are present', () => expect(getSystemProperties(systemPropertiesList)).toEqual(['http://a', 'http://b']));
});

describe('isRelationShape', () => {
    it('should return true for relation shapes', () => {
        expect(isRelationShape({[constants.SHACL_CLASS]: [{'@value': 'SomeClass'}]})).toBe(true);
    });
    it('should return false for other types of shapes', () => {
        expect(isRelationShape({[constants.SHACL_DATATYPE]: ['http://ex.com/type']})).toBe(false);
        expect(isRelationShape({})).toBe(false);
    });
});

describe('getClassesInCatalog', () => {
    const shapesIdsInCatalog = getClassesInCatalog(vocabularyJsonLd).map(c => c['@id']);

    it('should return classes without machineOnly predicate', () => {
        expect(shapesIdsInCatalog).toEqual(expect.arrayContaining(['http://fairspace.io/ontology#UserShape']));
    });

    it('should not return properties', () => {
        expect(shapesIdsInCatalog).not.toEqual(expect.arrayContaining(['http://www.w3.org/2000/01/rdf-schema#commentShape']));
        expect(shapesIdsInCatalog).not.toEqual(expect.arrayContaining(['http://www.schema.org/creatorShape']));
    });

    it('should not return classes with machineOnly predicate', () => {
        expect(shapesIdsInCatalog).not.toEqual(expect.arrayContaining(['http://fairspace.io/ontology#CollectionShape']));
    });

    it('should not return deleted classes', () => {
        expect(shapesIdsInCatalog).not.toEqual(expect.arrayContaining(['http://fairspace.io/ontology#DeletedClass']));
    });
});

describe('Class hierarchy (subclasses and descendants)', () => {
    const type = 'http://www.w3.org/ns/shacl#PropertyShape';
    const subClasses = ["http://fairspace.io/ontology#ControlledVocabularyPropertyShape", "http://fairspace.io/ontology#DatatypePropertyShape"];
    const subcSubClasess = ["http://fairspace.io/ontology#SpecialDatatypePropertyShape", "http://fairspace.io/ontology#AVerySpecialDatatypePropertyShape"];

    describe('getChildSubclasses', () => {
        it('should extracts the direct subclasses of the type and avoids deep or indirect subclasses', () => {
            const childClasses = getChildSubclasses(vocabularyJsonLd, type);

            expect(childClasses).toEqual(expect.arrayContaining(subClasses));
            expect(childClasses).not.toEqual(expect.arrayContaining(subcSubClasess));
        });
    });

    describe('getDescendants', () => {
        it('should extracts the full class hierarchy for the given type', () => {
            const classHierarchy = getDescendants(vocabularyJsonLd, type);

            expect(classHierarchy).toEqual(expect.arrayContaining([...subClasses, ...subcSubClasess]));
            expect(classHierarchy).not.toEqual(expect.arrayContaining(["http://fairspace.io/ontology#File"]));
        });
    });
});

describe('getNamespaces', () => {
    it('should return a full list of namespaces', () => {
        const namespaces = getNamespaces(vocabularyJsonLd);

        expect(namespaces.length).toEqual(2);
        expect(namespaces[0]).toEqual({
            id: "http://fairspace.io/ontology#Namespace1",
            label: "Namespace1",
            prefix: "ns1",
            namespace: "http://namespace1#",
            isDefault: true
        });
        expect(namespaces[1].isDefault).toBe(false);
    });
    it('should apply a filter to the namespaces if given', () => {
        const namespaces = getNamespaces(vocabularyJsonLd, n => n[constants.SHACL_NAME][0]["@value"] === "Namespace2");

        expect(namespaces.length).toEqual(1);
        expect(namespaces[0].label).toEqual("Namespace2");
    });
});

describe('getProperties', () => {
    it('returns all properties specified in the vocabulary', () => {
        const propertyShapes = determinePropertyShapesForTypes(vocabularyJsonLd, [constants.COLLECTION_URI]);
        const result = getProperties(vocabularyJsonLd, propertyShapes);

        expect(result.length).toBeGreaterThan(propertyShapes.length);
        expect(result.map(entry => entry.key)).toEqual(
            expect.arrayContaining(propertyShapes.map(propertyShape => getFirstPredicateId(propertyShape, constants.SHACL_PATH)))
        );
    });

    it('returns the type property', () => {
        const propertyShapes = determinePropertyShapesForTypes(vocabularyJsonLd, [constants.COLLECTION_URI]);
        const result = getProperties(vocabularyJsonLd, propertyShapes);
        const typeProperty = result.filter(p => p.key === '@type');

        expect(typeProperty.length).toBeGreaterThan(0);
        expect(typeProperty[0].label).toEqual('Type');
    });

    it('should use dash:singleLine to determine multiLine status', () => {
        const propertyShapes = [
            {
                [constants.SHACL_PATH]: [{'@id': constants.LABEL_URI}],
                [constants.SHACL_DATATYPE]: [{'@id': constants.STRING_URI}],
                [constants.DASH_SINGLE_LINE]: [{'@value': true}]
            },
            {
                [constants.SHACL_PATH]: [{'@id': constants.COMMENT_URI}],
                [constants.SHACL_DATATYPE]: [{'@id': constants.STRING_URI}],
                [constants.DASH_SINGLE_LINE]: [{'@value': false}]
            }
        ];

        const result = getProperties(vocabularyJsonLd, propertyShapes);
        expect(result.find(p => p.key === constants.LABEL_URI).multiLine).toBe(false);
        expect(result.find(p => p.key === constants.COMMENT_URI).multiLine).toBe(true);
    });
});
