import {findById, flattenShallow, compareBy, comparing, getFirstIfSingleItemArray} from "./genericUtils";

describe('array Utils', () => {
    describe('findById', () => {
        const mockCollectionsNoId = [{}];
        const mockCollections = [
            {
                id: 500,
                name: "Jan Smit's collection 1",
            },
            {
                id: 501,
                name: "Jan Smit's collection 2",
            },
        ];
        it('should get collection by id', () => {
            const res = findById(mockCollections, 500);
            expect(res.name).toBe('Jan Smit\'s collection 1');
        });
        it('should return undefined if collection is not found', () => {
            const res = findById(mockCollections, 509);
            expect(res).toBeUndefined();
        });
        it('should return undefined if searching by undefined item id', () => {
            const res = findById(mockCollections, undefined);
            expect(res).toBeUndefined();
        });
        it('should return undefined if collection does not have id property', () => {
            const res = findById(mockCollectionsNoId, 509);
            expect(res).toBeUndefined();
        });
        it('should return undefined if collections is null does not have id property', () => {
            const res = findById(null, 509);
            expect(res).toBeUndefined();
        });
    });

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

    describe('getFirstIfSingleItemArray', () => {
        it('return null if empty or null', () => {
            expect(getFirstIfSingleItemArray([])).toBeNull();
            expect(getFirstIfSingleItemArray(null)).toBeNull();
            expect(getFirstIfSingleItemArray(undefined)).toBeUndefined();
        });
        it('return single item if single item array', () => {
            expect(getFirstIfSingleItemArray([5])).toBe(5);
            expect(getFirstIfSingleItemArray(['item'])).toBe('item');
        });
        it('return array as it if it has more than one item', () => {
            expect(getFirstIfSingleItemArray([1, null, 9, 'x'])).toEqual([1, null, 9, 'x']);
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
});
