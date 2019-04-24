import {getFirstPredicateId, getFirstPredicateValue} from "./jsonLdUtils";

describe('json-ld Utils', () => {
    describe('getFirstPredicateValue', () => {
        it('should return undefined if a property does not exist', () => {
            expect(getFirstPredicateValue({name: 'John'}, 'age')).toEqual(undefined);
        });

        it('should return undefined if a property is empty', () => {
            expect(getFirstPredicateValue({numbers: []}, 'numbers')).toEqual(undefined);
        });

        it('should support literal properties', () => {
            expect(getFirstPredicateValue({numbers: [{'@value': 1}, {'@value': 2}]}, 'numbers')).toEqual(1);
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
            expect(getFirstPredicateId({numbers: [{'@id': 'http://example.com/1'}, {'@id': 'http://example.com/2'}]}, 'numbers'))
                .toEqual('http://example.com/1');
        });
    });
});
