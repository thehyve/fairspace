import {getCollectionById} from "./collectionUtils";

describe('collectionUtils', () => {
    describe('getCollectionById', () => {
        const mockCollections = [
            {
                "id": 500,
                "location": "Jan_Smit_s_collection-500",
                "name": "Jan Smit's collection 1",
                "description": "Jan Smit's collection, beyond the horizon 01",
                "uri": "https://workspace.ci.test.fairdev.app/iri/collections/500",
                "access": "Manage",
                "dateCreated": "2018-09-19T15:48:23.016165Z",
                "creator": "user4-id"
            },
            {
                "id": 501,
                "location": "Jan_Smit_s_collection-501",
                "name": "Jan Smit's collection 2",
                "description": "Jan Smit's collection, but he only can read",
                "uri": "https://workspace.ci.test.fairdev.app/iri/collections/503",
                "access": "Read",
                "dateCreated": "2018-09-19T15:48:23.016165Z",
                "creator": "user4-id"
            },
        ];

        it('should get collection by id', () => {
            const res = getCollectionById(mockCollections, 500);
            expect(res.name).toBe('Jan Smit\'s collection 1');
        });
        it('should return undefined if collection is not found', () => {
            const res = getCollectionById(mockCollections, 509);
            expect(res).toBeUndefined();
        });
    });
});
