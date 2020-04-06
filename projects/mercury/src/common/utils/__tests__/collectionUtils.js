import {getCollectionAbsolutePath} from "../collectionUtils";

describe('Collection Utils', () => {
    describe('getCollectionAbsolutePath', () => {
        it('should return valid collection absolute path', () => {
            const location = "Jan_Smit_s_collection-500";

            expect(getCollectionAbsolutePath(location)).toBe('/collections/Jan_Smit_s_collection-500');
        });
    });
});
