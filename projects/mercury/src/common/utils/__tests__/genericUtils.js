import {
    compareBy,
    comparePrimitives,
    comparing, first,
    flattenShallow,
    formatDateTime,
    isNonEmptyValue,
    joinWithSeparator, stableSort, typeNameToValue,
} from "../genericUtils";

describe('array Utils', () => {
    describe('flattenShallow', () => {
        it('flattens an array of arrays', () => {
            expect(flattenShallow([[1, 2], [], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
        });

        it('does not break on empty arrays', () => {
            expect(flattenShallow([])).toEqual([]);
        });

        it('goes only one level deep', () => {
            expect(flattenShallow([[[1, 2, 3]], [[4, 5]]])).toEqual([[1, 2, 3], [4, 5]]);
        });
    });
});

describe('comparison Utils', () => {
    describe('compareBy', () => {
        it('can compare by attribute', () => {
            expect([{a: 2}, {a: 3}, {a: 1}].sort(compareBy('a'))).toEqual([{a: 1}, {a: 2}, {a: 3}]);
            expect([{a: 2}, {a: 3}, {a: 1}].sort(compareBy('a', false))).toEqual([{a: 3}, {a: 2}, {a: 1}]);
        });

        it('can compare by function', () => {
            expect([{a: 2}, {a: 3}, {a: 1}].sort(compareBy(obj => obj.a))).toEqual([{a: 1}, {a: 2}, {a: 3}]);
            expect([{a: 2}, {a: 3}, {a: 1}].sort(compareBy(obj => obj.a, false))).toEqual([{a: 3}, {a: 2}, {a: 1}]);
        });
    });

    describe('comparing', () => {
        it('combines comparators', () => {
            const c = comparing(compareBy('x'), compareBy('y'), compareBy('z'));
            expect(c({x: 1, y: 2, z: 3}, {x: 1, y: 2, z: 3})).toBe(0);
            expect(c({x: 2, y: 2, z: 3}, {x: 1, y: 20, z: 30})).toBe(1);
            expect(c({x: 1, y: 2, z: 3}, {x: 1, y: 2, z: 4})).toBe(-1);
            expect(c({x: 1, y: 3, z: 3}, {x: 1, y: 2, z: 30})).toBe(1);
        });
    });

    describe('comparePrimitives', () => {
        it('compares numbers properly', () => {
            expect(comparePrimitives(1, 2)).toBe(-1);
            expect(comparePrimitives(2, 1)).toBe(1);
            expect(comparePrimitives(1, 1)).toBe(0);
        });

        it('compares string properly (cases are ignored)', () => {
            expect(comparePrimitives('B', 'a')).toBe(1);
            expect(comparePrimitives('b', 'a')).toBe(1);
            expect(comparePrimitives('a', 'x')).toBe(-1);
            expect(comparePrimitives('A', 'x')).toBe(-1);
            expect(comparePrimitives('abcde', 'abcde')).toBe(0);
        });

        it('compares string properly (accents of same base letter are equal)', () => {
            expect(comparePrimitives('a', 'á')).toBe(0);
            expect(comparePrimitives('A', 'á')).toBe(0);
        });
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

describe('joinWithSeparator', () => {
    it('should join multiple values into an array', () => {
        expect(joinWithSeparator(['a', 'b', 'c'], ' ')).toEqual(['a', ' ', 'b', ' ', 'c']);
    });
    it('should work with empty arrays', () => {
        expect(joinWithSeparator([], ' ')).toEqual([]);
    });
    it('should work with single entry arrays', () => {
        expect(joinWithSeparator(['a'], ' ')).toEqual(['a']);
    });
    it('should work without a separator', () => {
        expect(joinWithSeparator(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });
});

describe('first', () => {
    it('should return first element of the array', () => {
        expect(first(['a', 'b', 'c'])).toEqual('a');
    });
    it('should work with empty arrays', () => {
        expect(first([])).toEqual(undefined);
    });
    it('should work with nullable arrays', () => {
        expect(first(null)).toEqual(undefined);
    });
});

describe('formatDateTime', () => {
    it('should show date when it is not today', () => {
        const dateValue = '2008-09-15T15:53:00';
        const formatted = formatDateTime(dateValue);
        expect(formatted).toEqual('Sep 15, 2008');
    });

    it('should show time when it is today', () => {
        const dateValue = new Date().toISOString();
        const formatted = formatDateTime(dateValue);
        expect(formatted).not.toContain(',');
        expect(formatted).toContain(':');
        expect(formatted).toContain('M');
    });

    it('should return the given value for invalid dates', () => {
        const invalidDates = [
            '2014-25-23', '23/25/2014', [], 'x', null, undefined, '', NaN
        ];

        invalidDates.forEach(date => {
            expect(formatDateTime(date)).toEqual(date);
        });
    });
});

describe('stableSort', () => {
    it('respects sorting direction', () => {
        const a = ["c", "a", "b"];
        expect(stableSort(a, comparePrimitives, true)).toEqual(['a', 'b', 'c']);
        expect(stableSort(a, comparePrimitives, false)).toEqual(['c', 'b', 'a']);
    });
});

describe('typeNameToValue', () => {
    it('should return unchanged string', () => {
        expect(typeNameToValue('Test')).toEqual('Test');
    });
    it('should return whotespace separated string', () => {
        expect(typeNameToValue('TestWithCamelCase')).toEqual('Test With Camel Case');
    });
    it('should return empty string for null', () => {
        expect(typeNameToValue(null)).toEqual('');
    });
    it('should return empty string for non-string value', () => {
        expect(typeNameToValue(['test'])).toEqual('');
    });
});
