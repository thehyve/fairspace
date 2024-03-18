import {getExternalStorageAbsolutePath, getRelativePath} from '../externalStorageUtils';

describe('External Storage Utils', () => {
    describe('getExternalStorageAbsolutePath', () => {
        it('should return valid external storage absolute path', () => {
            expect(getExternalStorageAbsolutePath('/Jan_Smit_s_file', 'testStorage')).toBe(
                '/external-storages/testStorage/Jan_Smit_s_file'
            );
            expect(getExternalStorageAbsolutePath('/folder with file', 'testStorage2')).toBe(
                '/external-storages/testStorage2/folder%20with%20file'
            );
        });
    });
    describe('getRelativePath', () => {
        it('should return valid relative path', () => {
            expect(getRelativePath('/external-storages/testStorage/Jan_Smit_s_file', 'testStorage')).toBe(
                '/Jan_Smit_s_file'
            );
            expect(getRelativePath('/external-storages/testStorage', 'testStorage')).toBe('');
        });
    });
});
