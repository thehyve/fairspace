import {getLabel, navigableLink} from "./metadatautils";
import {LABEL_URI} from "../services/MetadataAPI/MetadataAPI";

describe('getLabel', () => {
    it('should return the label if present', () => {
        expect(getLabel({[LABEL_URI]: [{'@value': 'My label'}]})).toEqual('My label');
    });

    it('should not fail if json-ld is not properly expanded', () => {
        expect(getLabel({
            '@id': 'http://test.com/name',
            [LABEL_URI]: 'My label'
        })).toEqual('name');

        expect(getLabel({
            '@id': 'http://test.com/name',
            [LABEL_URI]: {'@value': 'My label'}
        })).toEqual('name');

        expect(getLabel({
            '@id': 'http://test.com/name',
            [LABEL_URI]: ['My label']
        })).toEqual('name');

        expect(getLabel({
            '@id': 'http://test.com/name',
            [LABEL_URI]: []
        })).toEqual('name');
    });

    it('should return part of the url after the pound sign', () => {
        expect(getLabel({'@id': 'http://test.nl/name#lastname'})).toEqual('lastname');
    });
    it('should return part of the url after the last slash if no pound sign present', () => {
        expect(getLabel({'@id': 'http://test.nl/name'})).toEqual('name');
    })
})

describe('navigableLink', () => {
    it('should transform IRI links within the current location to metadata', () => {
        expect(navigableLink('http://localhost/iri/test')).toEqual('http://localhost/metadata/test');
    });

    it('should transform IRI links to a collection to the collection page', () => {
        expect(navigableLink('http://localhost/iri/collections/412')).toEqual('http://localhost/collections/412');
    });

    it('should not transform links outside current location', () => {
        expect(navigableLink('http://other-url/iri/test')).toEqual('http://other-url/iri/test');
        expect(navigableLink('https://localhost/iri/test')).toEqual('https://localhost/iri/test');
    });

    it('should not change links outside the metadata', () => {
        expect(navigableLink('http://localhost/collections/300')).toEqual('http://localhost/collections/300');
    });

})
