import {compareBy, comparing} from "./comparisionUtils";

describe('comparisonUtils', () => {
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
});
