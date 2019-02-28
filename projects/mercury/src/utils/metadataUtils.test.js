import {getLabel, navigableLink, shouldPropertyBeHidden} from "./metadataUtils";
import {
    COLLECTION_URI,
    COMMENT_URI,
    DATE_DELETED_URI, DELETED_BY_URI,
    DIRECTORY_URI,
    FILE_PATH_URI,
    FILE_URI,
    LABEL_URI,
    TYPE_URI
} from "../constants";

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

    describe('shouldPropertyBeHidden', () => {
        it('should never show @type', () => {
            expect(shouldPropertyBeHidden({key: '@type', domain: 'http://example.com'})).toBe(true);
            expect(shouldPropertyBeHidden({key: '@type', domain: FILE_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: '@type', domain: DIRECTORY_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: '@type', domain: COLLECTION_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: TYPE_URI, domain: 'http://example.com'})).toBe(true);
            expect(shouldPropertyBeHidden({key: TYPE_URI, domain: FILE_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: TYPE_URI, domain: DIRECTORY_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: TYPE_URI, domain: COLLECTION_URI})).toBe(true);
        });

        it('should show comments for everything except to collections', () => {
            expect(shouldPropertyBeHidden({key: COMMENT_URI, domain: 'http://example.com'})).toBe(false);
            expect(shouldPropertyBeHidden({key: COMMENT_URI, domain: FILE_URI})).toBe(false);
            expect(shouldPropertyBeHidden({key: COMMENT_URI, domain: DIRECTORY_URI})).toBe(false);
            expect(shouldPropertyBeHidden({key: COMMENT_URI, domain: COLLECTION_URI})).toBe(true);
        });

        it('should not show labels for managed entities', () => {
            expect(shouldPropertyBeHidden({key: LABEL_URI, domain: 'http://example.com'})).toBe(false);
            expect(shouldPropertyBeHidden({key: LABEL_URI, domain: FILE_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: LABEL_URI, domain: DIRECTORY_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: LABEL_URI, domain: COLLECTION_URI})).toBe(true);
        });

        it('should never show fs:filePath', () => {
            expect(shouldPropertyBeHidden({key: FILE_PATH_URI, domain: 'http://example.com'})).toBe(true);
            expect(shouldPropertyBeHidden({key: FILE_PATH_URI, domain: FILE_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: FILE_PATH_URI, domain: DIRECTORY_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: FILE_PATH_URI, domain: COLLECTION_URI})).toBe(true);
        });

        it('should never show fs:dateDeleted', () => {
            expect(shouldPropertyBeHidden({key: DATE_DELETED_URI, domain: 'http://example.com'})).toBe(true);
            expect(shouldPropertyBeHidden({key: DATE_DELETED_URI, domain: FILE_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: DATE_DELETED_URI, domain: DIRECTORY_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: DATE_DELETED_URI, domain: COLLECTION_URI})).toBe(true);
        });

        it('should never show fs:deletedBy', () => {
            expect(shouldPropertyBeHidden({key: DELETED_BY_URI, domain: 'http://example.com'})).toBe(true);
            expect(shouldPropertyBeHidden({key: DELETED_BY_URI, domain: FILE_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: DELETED_BY_URI, domain: DIRECTORY_URI})).toBe(true);
            expect(shouldPropertyBeHidden({key: DELETED_BY_URI, domain: COLLECTION_URI})).toBe(true);
        });

        it('should always show regular properties', () => {
            expect(shouldPropertyBeHidden({key: 'http://example.com/property', domain: 'http://example.com'})).toBe(false);
            expect(shouldPropertyBeHidden({key: 'http://example.com/property', domain: FILE_URI})).toBe(false);
            expect(shouldPropertyBeHidden({key: 'http://example.com/property', domain: DIRECTORY_URI})).toBe(false);
            expect(shouldPropertyBeHidden({key: 'http://example.com/property', domain: COLLECTION_URI})).toBe(false);
        });
    });
});
