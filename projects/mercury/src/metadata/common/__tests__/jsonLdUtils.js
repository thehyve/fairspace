import {getFirstPredicateId, getFirstPredicateValue, normalizeJsonLdResource} from '../jsonLdUtils';

describe('json-ld Utils', () => {
    describe('getFirstPredicateValue', () => {
        it('should return undefined if a property does not exist', () => {
            expect(getFirstPredicateValue({name: 'John'}, 'age')).toEqual(undefined);
        });

        it('should return undefined if a property is empty', () => {
            expect(getFirstPredicateValue({numbers: []}, 'numbers')).toEqual(undefined);
        });

        it('should support literal properties', () => {
            expect(
                getFirstPredicateValue({numbers: [{'@value': 1}, {'@value': 2}]}, 'numbers')
            ).toEqual(1);
        });
    });

    describe('getFirstPredicateId', () => {
        it('should return undefined if a property does not exist', () => {
            expect(getFirstPredicateId({name: 'John'}, 'age')).toEqual(undefined);
        });

        it('should return undefined if a property is empty', () => {
            expect(getFirstPredicateId({numbers: []}, 'numbers')).toEqual(undefined);
        });

        it('should support reference properties', () => {
            expect(
                getFirstPredicateId(
                    {numbers: [{'@id': 'http://example.com/1'}, {'@id': 'http://example.com/2'}]},
                    'numbers'
                )
            ).toEqual('http://example.com/1');
        });
    });

    describe('normalizeJsonLdResource', () => {
        it('should convert objects with @value or @id into a literal', () => {
            expect(
                Object.values(
                    normalizeJsonLdResource({
                        a: [{'@value': 'a'}],
                        b: [{'@id': 'b'}],
                        c: [{'@value': 'c'}, {'@id': 'd'}]
                    })
                )
            ).toEqual([['a'], ['b'], ['c', 'd']]);
        });
        it('should be able to handle regular values', () => {
            const jsonLd = {
                '@id': 'http://url',
                '@type': ['http://type1', 'http://type2']
            };
            expect(normalizeJsonLdResource(jsonLd)).toEqual(jsonLd);
        });

        it('should return value if both value and id are given', () => {
            expect(
                Object.values(
                    normalizeJsonLdResource({
                        a: [{'@value': 'a', '@id': 'b'}]
                    })
                )
            ).toEqual([['a']]);
        });

        it('should return complete object if no value and id are given', () => {
            expect(
                Object.values(
                    normalizeJsonLdResource({
                        a: [{url: 'http://google.com'}]
                    })
                )
            ).toEqual([[{url: 'http://google.com'}]]);
        });

        it('should handle zero or false as actual values but not empty strings', () => {
            expect(
                Object.values(
                    normalizeJsonLdResource({
                        a: [
                            {'@value': 0, '@id': 'a'},
                            {'@value': false, '@id': 'b'},
                            {'@value': '', '@id': 'b'}
                        ]
                    })
                )
            ).toEqual([[0, false, '']]);
        });
    });
});
