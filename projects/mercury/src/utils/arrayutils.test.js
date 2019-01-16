import {findById} from "./arrayUtils";

describe('collectionUtils', () => {
    describe('getCollectionById', () => {
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
});
