import {
    extendPropertiesWithVocabularyEditingInfo,
    getMaxCount,
    getSystemProperties,
    isGenericIriResource,
    isRdfList, isRelationShape,
    vocabularyUtils,
} from '../vocabularyUtils';
import vocabularyJsonLd from '../test.vocabulary.json';
import * as constants from "../../../constants";

const vocabulary = vocabularyUtils(vocabularyJsonLd);
describe('vocabularyUtils', () => {
    describe('getLabelForPredicate', () => {
        it('returns the label for a known predicate', () => {
            expect(vocabulary.getLabelForPredicate('http://www.w3.org/2000/01/rdf-schema#label')).toEqual('Label');
        });

        it('returns the uri if no label is known for a predicate', () => {
            const uri = 'http://fairspace.io/ontology#Unknown';
            expect(vocabulary.getLabelForPredicate(uri)).toEqual(uri);
        });

        it('returns the uri if the predicate itself is unknown', () => {
            const uri = 'http://fairspace.io/ontology#NonExisting';
            expect(vocabulary.getLabelForPredicate(uri)).toEqual(uri);
        });
    });

    describe('determineShapeForProperty', () => {
        it('returns the correct shape given a url', () => {
            expect(vocabulary.determineShapeForProperty('http://www.w3.org/2000/01/rdf-schema#comment')['@id']).toEqual('http://www.w3.org/2000/01/rdf-schema#commentShape');
        });
        it('returns the correct shape if there is also a blank node pointing to it', () => {
            expect(vocabulary.determineShapeForProperty('http://fairspace.io/ontology#list')['@id']).toEqual('http://fairspace.io/ontology#listShape');
        });

        it('is undefined if there is only a blank node for a property', () => {
            expect(vocabulary.determineShapeForProperty('http://fairspace.io/ontology#only-blank')).toBe(undefined);
        });
    });

    describe('vocabulary contains', () => {
        it('should return true if the given id is present in the vocabulary', () => expect(vocabulary.contains(vocabularyJsonLd[0]['@id'])).toBe(true));
        it('should return false if the given id is not present in the vocabulary', () => expect(vocabulary.contains('http://not-present')).toBe(false));
        it('should return false on empty vocabulary', () => expect(vocabularyUtils().contains(vocabularyJsonLd[0]['@id'])).toBe(false));
        it('should return false on invalid URI', () => expect(vocabulary.contains('invalid-uri')).toBe(false));
        it('should return false on invalid parameter', () => expect(vocabulary.contains()).toBe(false));
        it('should return false if URI is only referred to in vocabulary', () => expect(vocabulary.contains('http://fairspace.io/ontology#Collection')).toBe(false));
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

    describe('extendPropertiesWithVocabularyEditingInfo', () => {
        const properties = [
            {id: 'a'},
            {id: 'b', key: 'http://uri'},
            {id: 'property', key: constants.SHACL_PROPERTY, values: [{id: 'http://custom'}, {id: 'http://fixed'}]}
        ];
        const systemProperties = ['http://a', 'http://b', 'http://fixed'];

        it('should set editable for all properties', () => {
            const extendedProperties = extendPropertiesWithVocabularyEditingInfo({properties});
            expect(extendedProperties[0].isEditable).toBe(true);
            expect(extendedProperties[1].isEditable).toBe(true);
            expect(extendedProperties[2].isEditable).toBe(true);
        });
        it('should include isFixed to determine editability', () => {
            const extendedProperties = extendPropertiesWithVocabularyEditingInfo({properties, isFixed: true});
            expect(extendedProperties[0].isEditable).toBe(false);
            expect(extendedProperties[1].isEditable).toBe(false);
            expect(extendedProperties[2].isEditable).toBe(true);
        });
        it('should include given systemProperties for SHACL_PROPERTY', () => {
            const extendedProperties = extendPropertiesWithVocabularyEditingInfo({properties, isFixed: true, systemProperties});
            expect(extendedProperties[2].systemProperties).toEqual(systemProperties);
        });

        it('should set deletable flag for values for SHACL_PROPERTY', () => {
            const extendedProperties = extendPropertiesWithVocabularyEditingInfo({properties, isFixed: true, systemProperties});
            expect(extendedProperties[2].values).toEqual([{id: 'http://custom', isDeletable: true}, {id: 'http://fixed', isDeletable: false}]);
        });
    });

    describe('isRelationShape', () => {
        it('should return true for relation shapes', () => {
            expect(isRelationShape({'@type': [constants.RELATION_SHAPE_URI]})).toBe(true);
            expect(isRelationShape({'@type': ['http://someShape', constants.RELATION_SHAPE_URI]})).toBe(true);
        });
        it('should return false for other types of shapes', () => {
            expect(isRelationShape({'@type': ['http://other-type']})).toBe(false);
            expect(isRelationShape({'@type': []})).toBe(false);
            expect(isRelationShape({})).toBe(false);
        });
    });

    describe('getClassesInCatalog', () => {
        const shapesIdsInCatalog = vocabulary.getClassesInCatalog().map(c => c['@id']);

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
    });

    describe('Class hierarchy (subclasses and descendants)', () => {
        const type = 'http://www.w3.org/ns/shacl#PropertyShape';
        const subClasses = ["http://fairspace.io/ontology#ControlledVocabularyPropertyShape", "http://fairspace.io/ontology#DatatypePropertyShape"];
        const subcSubClasess = ["http://fairspace.io/ontology#SpecialDatatypePropertyShape", "http://fairspace.io/ontology#AVerySpecialDatatypePropertyShape"];

        describe('getChildSubclasses', () => {
            it('should extracts the direct subclasses of the type and avoids deep or indirect subclasses', () => {
                const childClasses = vocabulary.getChildSubclasses(type);

                expect(childClasses).toEqual(expect.arrayContaining(subClasses));
                expect(childClasses).not.toEqual(expect.arrayContaining(subcSubClasess));
            });
        });

        describe('getDescendants', () => {
            it('should extracts the full class hierarchy for the given type', () => {
                const classHierarchy = vocabulary.getDescendants(type);

                expect(classHierarchy).toEqual(expect.arrayContaining([...subClasses, ...subcSubClasess]));
                expect(classHierarchy).not.toEqual(expect.arrayContaining(["http://fairspace.io/ontology#File"]));
            });
        });
    });

    describe('generatePropertyEntry', () => {
        it('should mark non-single-line properties as multiline', () => {
            const stringProperty = vocabulary.generatePropertyEntry('', {
                [constants.SHACL_DATATYPE]: [{'@id': constants.STRING_URI}],
                [constants.DASH_SINGLE_LINE]: [{'@value': false}]
            });
            expect(stringProperty.multiLine).toBe(true);
        });
        it('should mark single-line properties as not multiline', () => {
            const stringProperty = vocabulary.generatePropertyEntry('', {
                [constants.SHACL_DATATYPE]: [{'@id': constants.STRING_URI}],
                [constants.DASH_SINGLE_LINE]: [{'@value': true}]
            });
            expect(stringProperty.multiLine).toBe(false);
        });
    });

    describe('getNamespaces', () => {
        it('should return a full list of namespaces', () => {
            const namespaces = vocabulary.getNamespaces();

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
            const namespaces = vocabulary.getNamespaces(n => n[constants.SHACL_NAME][0]["@value"] === "Namespace2");

            expect(namespaces.length).toEqual(1);
            expect(namespaces[0].label).toEqual("Namespace2");
        });
    });
});
