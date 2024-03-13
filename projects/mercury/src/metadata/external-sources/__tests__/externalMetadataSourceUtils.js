import {getExternalMetadataSourcePathPrefix} from '../externalMetadataSourceUtils';

describe('External Metadata Source Utils', () => {
    describe('getExternalMetadataSourcePathPrefix', () => {
        it('should return valid external metadata source path', () => {
            expect(getExternalMetadataSourcePathPrefix('remoteMetadataSource'))
                .toBe('/metadata-sources/remoteMetadataSource');
        });
    });
});
