import nodeCrypto from "crypto";

import {
    generateUuid,
    getLabel,
    getLocalPart,
    getTypeInfo,
    hasValue,
    isNonEmptyValue, linkLabel,
    normalizeMetadataResource,
    partitionErrors,
    propertiesToShow,
    propertyContainsValueOrId,
    relativeLink,
    shouldPropertyBeHidden,
    simplifyUriPredicates,
    url2iri
} from "../metadataUtils";
import * as constants from "../../../constants";
import {normalizeJsonLdResource} from "../jsonLdUtils";

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
            values: [typeData]
        }];

        const vocabulary = {
            determineShapeForTypes: (typeIris) => ({[constants.SHACL_TARGET_CLASS]: [{'@id': typeIris[0]}]})
        };

        it('retrieves information on the type of the entity', () => {
            const metadata = generateMetadataWithType({
                id: 'http://example.com/123',
                label: 'some-label',
                comment: 'some-comment'
            });

            expect(getTypeInfo(metadata, vocabulary)).toEqual({
                label: 'some-label',
                description: 'some-comment'
            });
        });

        it('ignores missing comment', () => {
            const metadata = generateMetadataWithType({
                id: 'http://example.com/123',
                label: 'some-label'
            });

            expect(getTypeInfo(metadata, vocabulary)).toEqual({
                label: 'some-label',
                description: ''
            });
        });

        it('ignores missing label', () => {
            const metadata = generateMetadataWithType({
                id: 'http://example.com/123',
                comment: 'some-comment'
            });

            expect(getTypeInfo(metadata, vocabulary)).toEqual({
                description: 'some-comment',
                label: ''
            });
        });

        it('returns undefined if type is not present', () => {
            const metadata = [];

            expect(getTypeInfo(metadata, vocabulary)).toEqual({description: '', label: ''});
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

    describe('propertyContainsValueOrId', () => {
        const property = {
            values: [
                {value: 'first value'},
                {value: '321'},
                {id: '1234'},
                {value: 'other value'},
                {id: 'some-id-555', value: 'with given value'}
            ]
        };

        it('should returns true for the given values', () => {
            expect(propertyContainsValueOrId(property, 'first value')).toBe(true);
            expect(propertyContainsValueOrId(property, '321', 99)).toBe(true);
            expect(propertyContainsValueOrId(property, '321')).toBe(true);
            expect(propertyContainsValueOrId(property, null, '1234')).toBe(true);
            expect(propertyContainsValueOrId(property, 'other value')).toBe(true);
            expect(propertyContainsValueOrId(property, 'with given value', 'some-id-555')).toBe(true);
        });

        it('should returns false for the given values', () => {
            expect(propertyContainsValueOrId(property, null, '')).toBe(false);
            expect(propertyContainsValueOrId(property, 321)).toBe(false);
            expect(propertyContainsValueOrId(property, undefined, '12345')).toBe(false);
            expect(propertyContainsValueOrId(property, undefined, 'other value')).toBe(false);
            expect(propertyContainsValueOrId(property, 'some value value', 'other-id')).toBe(false);
            expect(propertyContainsValueOrId({}, 'with given value', 'some-id-555')).toBe(false);
            expect(propertyContainsValueOrId({}, undefined, null)).toBe(false);
        });
    });

    describe('hasValue', () => {
        it('should return false if no value is present', () => expect(hasValue({})).toBe(false));
        it('should return false if values list is empty', () => expect(hasValue({values: []})).toBe(false));
        it('should return false if only an empty string is is present', () => expect(hasValue({values: [{value: ""}]})).toBe(false));
        it('should return true if an id is present', () => expect(hasValue({values: [{id: "http://a"}]})).toBe(true));
        it('should return true if a non-empty value is present', () => expect(hasValue({values: [{value: "label"}]})).toBe(true));
    });

    describe('simplifyUriPredicates', () => {
        it('should convert keys into its localpart', () => {
            expect(Object.keys(simplifyUriPredicates({
                'http://namespace#test': [{'@value': 'a'}],
                'http://other-namespace/something#label': [{'@value': 'b'}],
                'simple-key': [{'@value': 'c'}]
            }))).toEqual(expect.arrayContaining(['test', 'label', 'simple-key']));
        });
        it('should not change @id and @type keys', () => {
            expect(Object.keys(normalizeJsonLdResource({
                '@id': [{'@value': 'a'}],
                '@type': [{'@value': 'b'}]
            }))).toEqual(expect.arrayContaining(['@id', '@type']));
        });
    });

    describe('normalizeMetadataResource', () => {
        it('should convert objects with value or id into a literal', () => {
            expect(Object.values(normalizeMetadataResource({
                a: [{value: 'a'}],
                b: [{id: 'b'}],
                c: [{value: 'c'}, {id: 'd'}]
            }))).toEqual([
                ['a'],
                ['b'],
                ['c', 'd']
            ]);
        });
        it('should be able to handle regular values', () => {
            const jsonLd = {
                '@id': 'http://url',
                '@type': ['http://type1', 'http://type2']
            };
            expect(normalizeMetadataResource(jsonLd)).toEqual(jsonLd);
        });

        it('should return value if both value and id are given', () => {
            expect(Object.values(normalizeMetadataResource({
                a: [{value: 'a', id: 'b'}]
            }))).toEqual([
                ['a']
            ]);
        });

        it('should return complete object if no value and id are given', () => {
            expect(Object.values(normalizeMetadataResource({
                a: [{url: 'http://google.com'}]
            }))).toEqual([
                [{url: 'http://google.com'}]
            ]);
        });

        it('should handle zero or false as actual values but not empty strings', () => {
            expect(Object.values(normalizeMetadataResource({
                a: [{value: 0, id: 'a'}, {value: false, id: 'b'}, {value: '', id: 'b'}],
            }))).toEqual([
                [0, false, 'b']
            ]);
        });
    });

    describe('getLocalPart', () => {
        it('should return the last part of the url with hash', () => {
            expect(getLocalPart('http://iri/test#local')).toEqual('local');
            expect(getLocalPart('http://iri/test#local/something-else')).toEqual('local/something-else');
        });

        it('should return the part after the last slash if no hash is present', () => {
            expect(getLocalPart('http://iri/test')).toEqual('test');
            expect(getLocalPart('http://iri/test/subpath')).toEqual('subpath');
        });

        it('should return the domain if no path or hash is present', () => {
            expect(getLocalPart('http://iri')).toEqual('iri');
            expect(getLocalPart('http://some.very.long.domain')).toEqual('some.very.long.domain');
        });
    });
});
