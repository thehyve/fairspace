import {getCollectionAbsolutePath} from "../collectionUtils";

describe('Collection Utils', () => {
    describe('getCollectionAbsolutePath', () => {
        it('should return valid collection absolute path', () => {
            const location = "Jan_Smit_s_collection-500";

            expect(getCollectionAbsolutePath(location)).toBe('/collections/Jan_Smit_s_collection-500');
        });

        it('should return valid collection absolute path with specified workspace', () => {
            const location = "Jan_Smit_s_collection-500";
            const workspace = "w1";

            expect(getCollectionAbsolutePath(location, workspace)).toBe('/workspaces/w1/collections/Jan_Smit_s_collection-500');
        });

        it('should return empty string when no location is specified', () => {
            expect(getCollectionAbsolutePath('')).toBe('');
            expect(getCollectionAbsolutePath()).toBe('');
        });
    });
});
