import {getCollectionAbsolutePath} from "./collectionUtils";

describe('Collection Utils', () => {
    describe(getCollectionAbsolutePath.name, () => {
        it('should return valid collection absolute path', () => {
            const collection = {
                location: "Jan_Smit_s_collection-500",
                name: "Jan Smit's collection 1",
                description: "Jan Smit's collection, beyond the horizon 01",
                iri: "https://workspace.ci.test.fairdev.app/iri/500",
                access: "Manage",
                type: "LOCAL_STORAGE",
                dateCreated: "2018-09-19T15:48:23.016165Z",
                creator: "user4-id"
            };

            expect(getCollectionAbsolutePath(collection)).toBe('/collections/Jan_Smit_s_collection-500');
        });

        it('should return empty string when no location is specified', () => {
            const collection = {
                name: "Jan Smit's collection 1",
                description: "Jan Smit's collection, beyond the horizon 01",
                iri: "https://workspace.ci.test.fairdev.app/iri/500",
                access: "Manage",
                type: "LOCAL_STORAGE",
                dateCreated: "2018-09-19T15:48:23.016165Z",
                creator: "user4-id"
            };

            expect(getCollectionAbsolutePath(collection)).toBe('');
        });

        it('should return empty string when no collection is specified', () => {
            expect(getCollectionAbsolutePath()).toBe('');
        });
    });
});
