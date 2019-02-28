import {getLabel, navigableLink, shouldBeHidden} from "./metadataUtils";
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

    describe('shouldBeHidden', () => {
        it('should never show @type', () => {
            expect(shouldBeHidden('@type', 'http://example.com')).toBe(true);
            expect(shouldBeHidden('@type', FILE_URI)).toBe(true);
            expect(shouldBeHidden('@type', DIRECTORY_URI)).toBe(true);
            expect(shouldBeHidden('@type', COLLECTION_URI)).toBe(true);
            expect(shouldBeHidden(TYPE_URI, 'http://example.com')).toBe(true);
            expect(shouldBeHidden(TYPE_URI, FILE_URI)).toBe(true);
            expect(shouldBeHidden(TYPE_URI, DIRECTORY_URI)).toBe(true);
            expect(shouldBeHidden(TYPE_URI, COLLECTION_URI)).toBe(true);
        });
        it('should show comments for everything except to collections', () => {
            expect(shouldBeHidden(COMMENT_URI, 'http://example.com')).toBe(false);
            expect(shouldBeHidden(COMMENT_URI, FILE_URI)).toBe(false);
            expect(shouldBeHidden(COMMENT_URI, DIRECTORY_URI)).toBe(false);
            expect(shouldBeHidden(COMMENT_URI, COLLECTION_URI)).toBe(true);
        });
        it('should not show labels for managed entities', () => {
            expect(shouldBeHidden(LABEL_URI, 'http://example.com')).toBe(false);
            expect(shouldBeHidden(LABEL_URI, FILE_URI)).toBe(true);
            expect(shouldBeHidden(LABEL_URI, DIRECTORY_URI)).toBe(true);
            expect(shouldBeHidden(LABEL_URI, COLLECTION_URI)).toBe(true);
        });
        it('should never show fs:filePath', () => {
            expect(shouldBeHidden(FILE_PATH_URI, 'http://example.com')).toBe(true);
            expect(shouldBeHidden(FILE_PATH_URI, FILE_URI)).toBe(true);
            expect(shouldBeHidden(FILE_PATH_URI, DIRECTORY_URI)).toBe(true);
            expect(shouldBeHidden(FILE_PATH_URI, COLLECTION_URI)).toBe(true);
        });
        it('should never show fs:dateDeleted', () => {
            expect(shouldBeHidden(DATE_DELETED_URI, 'http://example.com')).toBe(true);
            expect(shouldBeHidden(DATE_DELETED_URI, FILE_URI)).toBe(true);
            expect(shouldBeHidden(DATE_DELETED_URI, DIRECTORY_URI)).toBe(true);
            expect(shouldBeHidden(DATE_DELETED_URI, COLLECTION_URI)).toBe(true);
        });
        it('should never show fs:deletedBy', () => {
            expect(shouldBeHidden(DELETED_BY_URI, 'http://example.com')).toBe(true);
            expect(shouldBeHidden(DELETED_BY_URI, FILE_URI)).toBe(true);
            expect(shouldBeHidden(DELETED_BY_URI, DIRECTORY_URI)).toBe(true);
            expect(shouldBeHidden(DELETED_BY_URI, COLLECTION_URI)).toBe(true);
        });
        it('should always show regular properties', () => {
            expect(shouldBeHidden('http://example.com/property', 'http://example.com')).toBe(false);
            expect(shouldBeHidden('http://example.com/property', FILE_URI)).toBe(false);
            expect(shouldBeHidden('http://example.com/property', DIRECTORY_URI)).toBe(false);
            expect(shouldBeHidden('http://example.com/property', COLLECTION_URI)).toBe(false);
        });
    });
});
