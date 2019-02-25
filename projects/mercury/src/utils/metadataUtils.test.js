import {getLabel, navigableLink, getCollectionAbsolutePath} from "./metadataUtils";
import {LABEL_URI} from "../constants";

describe('Metadata Utils', () => {
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

    it('should return valid collection absolute path', () => {
        const collection = {
            location: "Jan_Smit_s_collection-500",
            name: "Jan Smit's collection 1",
            description: "Jan Smit's collection, beyond the horizon 01",
            iri: "https://workspace.ci.test.fairdev.app/iri/500",
            access: "Manage",
            type: "LOCAL_STORAGE",
            dateCreated: "2018-09-19T15:48:23.016165Z",
            creator: "user4-id"
        };

        expect(getCollectionAbsolutePath(collection)).toBe('/collections/Jan_Smit_s_collection-500');
    });
});
