import {getCollectionAbsolutePath} from "../collectionUtils";

describe('Collection Utils', () => {
    describe(getCollectionAbsolutePath.name, () => {
        it('should return valid collection absolute path', () => {
            const location = "Jan_Smit_s_collection-500";

            expect(getCollectionAbsolutePath(location)).toBe('/collections/Jan_Smit_s_collection-500');
        });

        it('should return empty string when no location is specified', () => {
            expect(getCollectionAbsolutePath('')).toBe('');
        });

        it('should return empty string when no collection is specified', () => {
            expect(getCollectionAbsolutePath()).toBe('');
        });
    });
});
