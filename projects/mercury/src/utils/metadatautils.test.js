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
        }, true)).toEqual('name');

        expect(getLabel({
            '@id': 'http://test.com/name',
            [LABEL_URI]: {'@value': 'My label'}
        }, true)).toEqual('name');

        expect(getLabel({
            '@id': 'http://test.com/name',
            [LABEL_URI]: ['My label']
        }, true)).toEqual('name');

        expect(getLabel({
            '@id': 'http://test.com/name',
            [LABEL_URI]: []
        }, true)).toEqual('name');
    });

    it('should keep external urls intact if shortenExternalUris is set to false', () => {
        expect(getLabel({'@id': 'http://test.nl/name#lastname'}, false)).toEqual('http://test.nl/name#lastname');
    });
    it('should return part of the url after the pound sign', () => {
        expect(getLabel({'@id': 'http://test.nl/name#lastname'}, true)).toEqual('lastname');
    });
    it('should return part of the url after the last slash if no pound sign present', () => {
        expect(getLabel({'@id': 'http://test.nl/name'}, true)).toEqual('name');
    });
});

describe('navigableLink', () => {
    it('should keep IRI links', () => {
        expect(navigableLink('http://localhost/iri/test')).toEqual('http://localhost/iri/test');
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
});
