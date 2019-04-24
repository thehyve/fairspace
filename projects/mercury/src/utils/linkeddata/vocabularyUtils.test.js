import {isGenericIriResource, isRdfList, vocabularyUtils} from './vocabularyUtils';
import vocabularyJsonLd from './test.vocabulary.json';
import * as constants from "../../constants";

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
});
