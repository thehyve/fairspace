import * as constants from '../../../constants';
import {fromJsonLd, getJsonLdForSubject, normalizeTypes, toJsonLd} from '../jsonLdConverter';

describe('jsonLdConverter', () => {
    describe('fromJsonLd', () => {
        const subject = 'http://fairspace.com/iri/collections/1';

        const propertyShapes = [
            {
                '@id': 'http://labelShape',
                [constants.SHACL_PATH]: [{'@id': constants.LABEL_URI}]
            },
            {
                '@id': 'http://commentShape',
                [constants.SHACL_PATH]: [{'@id': constants.COMMENT_URI}]
            },
            {
                '@id': 'http://collectionShape',
                [constants.SHACL_PATH]: [{'@id': constants.COLLECTION_URI}]
            },
            {
                '@id': 'http://listShape',
                [constants.SHACL_PATH]: [{'@id': 'http://list'}],
                [constants.SHACL_NODE]: [{'@id': constants.DASH_LIST_SHAPE}]
            }
        ];

        it('should return values for each predicate', () => {
            const metadata = {
                '@id': subject,
                '@type': ['https://fairspace.nl/ontology#Collection'],
                [constants.COMMENT_URI]: [
                    {'@value': 'My first collection'},
                    {'@value': 'Some more info'}
                ]
            };

            const valuesByPredicate = fromJsonLd(metadata, propertyShapes);

            expect(valuesByPredicate[constants.COMMENT_URI].map(v => v.value)).toEqual([
                'My first collection',
                'Some more info'
            ]);
        });

        describe('sorting', () => {
            it('should return references sorted on the other label', () => {
                const metadata = {
                    '@id': subject,
                    '@type': ['https://fairspace.nl/ontology#Collection'],
                    [constants.COLLECTION_URI]: [{'@id': 'http://a'}, {'@id': 'http://b'}]
                };

                const allMetadata = {
                    'http://a': {
                        '@id': 'http://a',
                        [constants.LABEL_URI]: [{'@value': 'ZZZ'}]
                    },
                    'http://b': {
                        '@id': 'http://b',
                        [constants.LABEL_URI]: [{'@value': 'AAA'}]
                    }
                };

                const valuesByPredicate = fromJsonLd(metadata, propertyShapes, allMetadata);

                expect(valuesByPredicate[constants.COLLECTION_URI].map(v => v.id)).toEqual([
                    'http://b',
                    'http://a'
                ]);
            });

            it('should return values sorted', () => {
                const metadata = {
                    '@id': subject,
                    '@type': ['https://fairspace.nl/ontology#Collection'],
                    [constants.COMMENT_URI]: [
                        {
                            '@value': 'ZZZZ'
                        },
                        {
                            '@value': 'AAAA'
                        }
                    ]
                };

                const valuesByPredicate = fromJsonLd(metadata, propertyShapes);

                expect(valuesByPredicate[constants.COMMENT_URI].map(v => v.value)).toEqual([
                    'AAAA',
                    'ZZZZ'
                ]);
            });

            it('should not sort rdf lists', () => {
                const metadata = {
                    '@id': subject,
                    '@type': ['https://fairspace.nl/ontology#Collection'],
                    'http://list': [
                        {
                            '@list': [{'@value': 'ZZZ'}, {'@value': 'AAA'}]
                        }
                    ]
                };

                const valuesByPredicate = fromJsonLd(metadata, propertyShapes);

                expect(valuesByPredicate['http://list'].map(v => v.value)).toEqual(['ZZZ', 'AAA']);
            });
        });

        it('should parse rdf lists correctly', () => {
            const metadata = {
                '@id': subject,
                '@type': ['https://fairspace.nl/ontology#Collection'],
                'http://list': [
                    {
                        '@list': [{'@value': 'My first collection'}, {'@value': 'Some more info'}]
                    }
                ]
            };

            const valuesByPredicate = fromJsonLd(metadata, propertyShapes);

            expect(valuesByPredicate['http://list'].map(v => v.value)).toEqual([
                'My first collection',
                'Some more info'
            ]);
        });
        it('should not include properties for which no shape is given', () => {
            const metadata = {
                '@id': subject,
                '@type': ['https://fairspace.nl/ontology#Collection'],
                'http://not-existing': [
                    {'@value': 'My first collection'},
                    {'@value': 'Some more info'}
                ]
            };

            const valuesByPredicate = fromJsonLd(metadata, propertyShapes);
            expect(
                Object.prototype.hasOwnProperty.call(valuesByPredicate, 'http://not-existing')
            ).toEqual(false);
        });

        it('should return information about the other entry for reference', () => {
            const metadata = {
                '@id': subject,
                '@type': ['https://fairspace.nl/ontology#Collection'],
                [constants.COLLECTION_URI]: [{'@id': 'http://a'}, {'@id': 'http://b'}]
            };

            const allMetadata = {
                'http://a': {
                    '@id': 'http://a',
                    [constants.LABEL_URI]: [{'@value': 'AAA'}]
                },
                'http://b': {
                    '@id': 'http://b',
                    [constants.LABEL_URI]: [{'@value': 'BBB'}]
                }
            };

            const valuesByPredicate = fromJsonLd(metadata, propertyShapes, allMetadata);

            expect(valuesByPredicate[constants.COLLECTION_URI].map(v => v.label)).toEqual([
                'AAA',
                'BBB'
            ]);
        });
    });

    describe('getJsonLdForSubject', () => {
        it('should return jsonLd for a single subject', () => {
            const metadata = [
                {
                    '@id': 'http://subject',
                    '@type': ['http://my-type'],
                    'http://label': [{'@value': 'label'}]
                },
                {
                    '@id': 'http://other'
                }
            ];

            expect(getJsonLdForSubject(metadata, 'http://subject')).toEqual(metadata[0]);
        });

        it('should return nothing if the subject is not found', () => {
            const metadata = [
                {
                    '@id': 'http://subject',
                    '@type': ['http://my-type'],
                    'http://label': [{'@value': 'label'}]
                }
            ];

            expect(getJsonLdForSubject(metadata, 'http://other-subject')).toEqual({});
        });
    });

    describe('toJsonLd', () => {
        it('should creates a valid json-ld (@value)', () => {
            const subject = 'some-subject';
            const predicate = 'some-predicate';
            const values = [{value: 'some-value'}];

            const jsonLd = toJsonLd(subject, predicate, values, []);

            const expected = {
                '@id': 'some-subject',
                'some-predicate': [{'@value': 'some-value'}]
            };

            expect(jsonLd).toEqual(expected);
        });

        it('should creates a valid json-ld (@id)', () => {
            const subject = 'some-subject';
            const predicate = 'some-predicate';
            const values = [{id: 'some-id'}];

            const jsonLd = toJsonLd(subject, predicate, values, []);

            const expected = {
                '@id': 'some-subject',
                'some-predicate': [{'@id': 'some-id'}]
            };

            expect(jsonLd).toEqual(expected);
        });

        it('returns null if no valid predicate is provided', () => {
            const subject = 'some-subject';
            const values = [{id: 'some-id'}];
            const jsonLd = toJsonLd(subject, null, values, []);

            expect(jsonLd).toEqual(null);
        });

        it('returns null if no valid values are provided', () => {
            const subject = 'some-subject';
            const predicate = 'some-predicate';
            const jsonLd = toJsonLd(subject, predicate, null, []);

            expect(jsonLd).toEqual(null);
        });

        it('serializes a an empty list as fs:NIL', () => {
            const subject = 'some-subject';
            const predicate = 'some-predicate';
            const jsonLd = toJsonLd(subject, predicate, [], []);

            const expected = {
                '@id': 'some-subject',
                [predicate]: {'@id': constants.NIL_URI}
            };

            expect(jsonLd).toEqual(expected);
        });

        it('serializes a list with only empty values as fs:NIL', () => {
            const subject = 'some-subject';
            const predicate = 'some-predicate';
            const values = [{value: ''}, {value: undefined}, {value: null}];
            const jsonLd = toJsonLd(subject, predicate, values, []);

            const expected = {
                '@id': 'some-subject',
                [predicate]: {'@id': constants.NIL_URI}
            };

            expect(jsonLd).toEqual(expected);
        });

        it('filters out invalid values', () => {
            const subject = 'some-subject';
            const predicate = 'some-predicate';
            const values = [
                {value: ''},
                {value: undefined},
                {value: null},
                {value: 'some-value'},
                {value: 'some-other-value'}
            ];
            const jsonLd = toJsonLd(subject, predicate, values, []);

            const expected = {
                '@id': 'some-subject',
                'some-predicate': [{'@value': 'some-value'}, {'@value': 'some-other-value'}]
            };

            expect(jsonLd).toEqual(expected);
        });

        it('returns null if no valid subject is provided', () => {
            const predicate = 'some-predicate';
            const values = [{id: 'some-id'}];
            const jsonLd = toJsonLd(null, predicate, values, []);

            expect(jsonLd).toEqual(null);
        });

        it('return null if no parameters are sent', () => {
            const jsonLd = toJsonLd();

            expect(jsonLd).toEqual(null);
        });
    });

    describe('normalizeTypes', () => {
        it('replaces rdf:type with @type', () => {
            const result = normalizeTypes([
                {
                    '@id': 'http://example.com/1',
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': [
                        {'@id': 'http://example.com/Type'}
                    ]
                },
                {'@id': 'http://example.com/2', '@type': ['http://example.com/Type']},
                {'@id': 'http://example.com/2', 'http://example.com/property': [123]}
            ]);

            expect(result).toEqual([
                {'@id': 'http://example.com/1', '@type': ['http://example.com/Type']},
                {'@id': 'http://example.com/2', '@type': ['http://example.com/Type']},
                {'@id': 'http://example.com/2', 'http://example.com/property': [123]}
            ]);
        });
    });
});
