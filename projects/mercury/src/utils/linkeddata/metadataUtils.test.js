import nodeCrypto from "crypto";

import {
    generateUuid,
    getLabel,
    getTypeInfo,
    linkLabel,
    propertiesToShow,
    relativeLink,
    shouldPropertyBeHidden,
    url2iri,
    isNonEmptyValue,
    partitionErrors
} from "./metadataUtils";
import * as constants from "../../constants";

describe('Metadata Utils', () => {
    describe('linkLabel', () => {
        it('handles local IRIs', () => {
            expect(linkLabel('http://localhost/iri/1234')).toEqual('1234');
            expect(linkLabel('http://localhost/vocabulary/1234')).toEqual('1234');
        });

        it('handles local IRIs with query and hash', () => {
            expect(linkLabel('http://localhost/iri/some-identifier/extra?query#hash')).toEqual('some-identifier/extra?query#hash');
        });

        it('handles local collections', () => {
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
            expect(getLabel({[constants.LABEL_URI]: [{'@value': 'My label'}]})).toEqual('My label');
        });

        it('should return the shacl name if no label is present', () => {
            expect(getLabel({'http://www.w3.org/ns/shacl#name': [{'@value': 'My label'}]})).toEqual('My label');
        });

        it('should not fail if json-ld is not properly expanded', () => {
            expect(getLabel({
                '@id': 'http://test.com/name',
                [constants.LABEL_URI]: 'My label'
            }, true)).toEqual('name');

            expect(getLabel({
                '@id': 'http://test.com/name',
                [constants.LABEL_URI]: {'@value': 'My label'}
            }, true)).toEqual('name');

            expect(getLabel({
                '@id': 'http://test.com/name',
                [constants.LABEL_URI]: ['My label']
            }, true)).toEqual('name');

            expect(getLabel({
                '@id': 'http://test.com/name',
                [constants.LABEL_URI]: []
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

    describe('shouldPropertyBeHidden', () => {
        it('should never show @type', () => {
            expect(shouldPropertyBeHidden('@type', 'http://example.com')).toBe(true);
            expect(shouldPropertyBeHidden('@type', constants.FILE_URI)).toBe(true);
            expect(shouldPropertyBeHidden('@type', constants.DIRECTORY_URI)).toBe(true);
            expect(shouldPropertyBeHidden('@type', constants.COLLECTION_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.TYPE_URI, 'http://example.com')).toBe(true);
            expect(shouldPropertyBeHidden(constants.TYPE_URI, constants.FILE_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.TYPE_URI, constants.DIRECTORY_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.TYPE_URI, constants.COLLECTION_URI)).toBe(true);
        });

        it('should show comments for everything except to collections', () => {
            expect(shouldPropertyBeHidden(constants.COMMENT_URI, 'http://example.com')).toBe(false);
            expect(shouldPropertyBeHidden(constants.COMMENT_URI, constants.FILE_URI)).toBe(false);
            expect(shouldPropertyBeHidden(constants.COMMENT_URI, constants.DIRECTORY_URI)).toBe(false);
            expect(shouldPropertyBeHidden(constants.COMMENT_URI, constants.COLLECTION_URI)).toBe(true);
        });

        it('should not show labels for managed entities', () => {
            expect(shouldPropertyBeHidden(constants.LABEL_URI, 'http://example.com')).toBe(false);
            expect(shouldPropertyBeHidden(constants.LABEL_URI, constants.FILE_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.LABEL_URI, constants.DIRECTORY_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.LABEL_URI, constants.COLLECTION_URI)).toBe(true);
        });

        it('should never show fs:filePath', () => {
            expect(shouldPropertyBeHidden(constants.FILE_PATH_URI, 'http://example.com')).toBe(true);
            expect(shouldPropertyBeHidden(constants.FILE_PATH_URI, constants.FILE_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.FILE_PATH_URI, constants.DIRECTORY_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.FILE_PATH_URI, constants.COLLECTION_URI)).toBe(true);
        });

        it('should never show fs:dateDeleted', () => {
            expect(shouldPropertyBeHidden(constants.DATE_DELETED_URI, 'http://example.com')).toBe(true);
            expect(shouldPropertyBeHidden(constants.DATE_DELETED_URI, constants.FILE_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.DATE_DELETED_URI, constants.DIRECTORY_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.DATE_DELETED_URI, constants.COLLECTION_URI)).toBe(true);
        });

        it('should never show fs:deletedBy', () => {
            expect(shouldPropertyBeHidden(constants.DELETED_BY_URI, 'http://example.com')).toBe(true);
            expect(shouldPropertyBeHidden(constants.DELETED_BY_URI, constants.FILE_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.DELETED_BY_URI, constants.DIRECTORY_URI)).toBe(true);
            expect(shouldPropertyBeHidden(constants.DELETED_BY_URI, constants.COLLECTION_URI)).toBe(true);
        });

        it('should always show regular properties', () => {
            expect(shouldPropertyBeHidden('http://example.com/property', 'http://example.com')).toBe(false);
            expect(shouldPropertyBeHidden('http://example.com/property', constants.FILE_URI)).toBe(false);
            expect(shouldPropertyBeHidden('http://example.com/property', constants.DIRECTORY_URI)).toBe(false);
            expect(shouldPropertyBeHidden('http://example.com/property', constants.COLLECTION_URI)).toBe(false);
        });
    });


    describe('propertiesToShow', () => {
        it('should hide the type of an entity', () => {
            const properties = [{
                key: "@type",
                values: [{id: "http://fairspace.io/ontology#Collection", comment: "A specific collection in Fairspace."}]
            }, {
                key: "http://fairspace.io/ontology#createdBy",
                values: [{id: "http://fairspace.io/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd"}]
            }, {
                key: "http://fairspace.io/ontology#dateCreated",
                values: [{value: "2019-03-18T13:06:22.62Z"}]
            }];

            const expected = [
                {
                    key: "http://fairspace.io/ontology#createdBy",
                    values: [{id: "http://fairspace.io/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd"}]
                }, {
                    key: "http://fairspace.io/ontology#dateCreated",
                    values: [{value: "2019-03-18T13:06:22.62Z"}]
                }];

            expect(propertiesToShow(properties)).toEqual(expected);
        });
    });

    describe('url2iri', () => {
        it('returns http scheme regardless of the input scheme', () => {
            expect(url2iri('scheme://example.com/some/path')).toEqual('http://example.com/some/path');
        });
        it('removes the port number from the uri', () => {
            expect(url2iri('http://example.com:1234/some/path')).toEqual('http://example.com/some/path');
        });

        it('handles urls with query and fragment ', () => {
            expect(url2iri('scheme://example.com/some/path/?query#some-fragment')).toEqual('http://example.com/some/path/?query#some-fragment');
        });

        it('removes empty fragment or query strings', () => {
            expect(url2iri('scheme://example.com/some/path/?#')).toEqual('http://example.com/some/path/');
        });

        it('return the unmodified uri if it is invalid', () => {
            expect(url2iri('some-invalid-uri')).toEqual('some-invalid-uri');
        });
    });

    describe('getTypeInfo', () => {
        const generateMetadataWithType = (typeData) => [{
            key: '@type',
            values: [{...typeData}]
        }];

        it('retrieves information on the type of the entity', () => {
            const metadata = generateMetadataWithType({
                label: 'some-label',
                comment: 'some-comment'
            });

            expect(getTypeInfo(metadata)).toEqual({
                label: 'some-label',
                description: 'some-comment'
            });
        });

        it('ignores missing comment', () => {
            const metadata = generateMetadataWithType({
                label: 'some-label'
            });

            expect(getTypeInfo(metadata)).toEqual({
                label: 'some-label',
                description: ''
            });
        });

        it('ignores missing label', () => {
            const metadata = generateMetadataWithType({
                comment: 'some-comment'
            });

            expect(getTypeInfo(metadata)).toEqual({
                description: 'some-comment',
                label: ''
            });
        });

        it('returns undefined if type is not present', () => {
            const metadata = [];

            expect(getTypeInfo(metadata)).toEqual({description: '', label: ''});
        });
    });

    describe('isNonEmptyValue', () => {
        it('Returns true for the given values', () => {
            const values = ['something', 0, 9999, ' ', true, false, -999, {}, []];

            values.forEach(v => expect(isNonEmptyValue(v)).toBe(true));
        });
        it('Returns false for the given values', () => {
            const values = [undefined, null, '', NaN, "", ``];

            values.forEach(v => expect(isNonEmptyValue(v)).toBe(false));
        });
    });

    describe('partitionErrors', () => {
        it('returns 2 arrays one for errors of the given subjects other is the rest of errors', () => {
            const errorsSub1 = [
                {
                    message: "Error message...",
                    subject: "subject1",
                    predicate: "some-predicate-x"
                },
                {
                    message: "Error message",
                    subject: "subject1",
                    predicate: "some-predicate-y"
                }
            ];
            const errorsSub2 = [
                {
                    message: "Error message x",
                    subject: "subject2",
                    predicate: "some-predicate-a"
                },
                {
                    message: "Error message y",
                    subject: "subject2",
                    predicate: "some-predicate-b"
                }
            ];
            const allErrors = [...errorsSub1, ...errorsSub2];

            expect(partitionErrors(allErrors, 'subject1'))
                .toEqual({
                    entityErrors: errorsSub1,
                    otherErrors: errorsSub2
                });
        });
    });
});
