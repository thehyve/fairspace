import nodeCrypto from "crypto";
import {generateUuid, getLabel, getSingleValue, getValues, linkLabel, relativeLink} from "./metadataUtils";
import {LABEL_URI} from "../constants";


describe('Metadata Utils', () => {
    describe('linkLabel', () => {
        it('handles IRIs', () => {
            expect(linkLabel('http://localhost/iri/1234')).toEqual('1234');
        });

        it('handles collections', () => {
            expect(linkLabel('http://localhost/collections/coll1')).toEqual('coll1');
        });

        it('can shorten external URLs', () => {
            expect(linkLabel('http://example.com/path', false)).toEqual('http://example.com/path');
            expect(linkLabel('http://example.com/path', true)).toEqual('path');
            expect(linkLabel('http://example.com/path#hash', false)).toEqual('http://example.com/path#hash');
            expect(linkLabel('http://example.com/path#hash', true)).toEqual('hash');
        });
    });

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

    describe('getValues', () => {
        it('should return an empty array if a property does not exist', () => {
            expect(getValues({name: 'John'}, 'age')).toEqual([]);
        });

        it('should support literal properties', () => {
            expect(getValues({numbers: [{'@value': 1}, {'@value': 2}]}, 'numbers')).toEqual([1, 2]);
        });

        it('should support refernce properties', () => {
            expect(getValues({numbers: [{'@id': 'http://example.com/1'}, {'@id': 'http://example.com/2'}]}, 'numbers'))
                .toEqual(['http://example.com/1', 'http://example.com/2']);
        });
    });

    describe('getSingleValue', () => {
        it('should return undefined if a property does not exist', () => {
            expect(getSingleValue({name: 'John'}, 'age')).toEqual(undefined);
        });

        it('should return undefined if a property is empty', () => {
            expect(getSingleValue({numbers: []}, 'numbers')).toEqual(undefined);
        });


        it('should support literal properties', () => {
            expect(getSingleValue({numbers: [{'@value': 1}, {'@value': 2}]}, 'numbers')).toEqual(1);
        });

        it('should support reference properties', () => {
            expect(getSingleValue({numbers: [{'@id': 'http://example.com/1'}, {'@id': 'http://example.com/2'}]}, 'numbers'))
                .toEqual('http://example.com/1');
        });
    });

    describe('relativeLink', () => {
        it('should strip the base URL', () => {
            expect(relativeLink('http://example.com:1234/some/path?query=value#bookmark'))
                .toEqual('/some/path?query=value#bookmark');
        });

        it('should also handle simple URLs', () => {
            expect(relativeLink('http://example.com'))
                .toEqual('example.com');
        });
    });

    describe('generateUuid', () => {
        it('should generate valid UUIDS', () => {
            global.crypto = {
                getRandomValues: nodeCrypto.randomFillSync
            };
            const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(UUID_REGEX.test(generateUuid())).toBe(true);
        });
    });
});
