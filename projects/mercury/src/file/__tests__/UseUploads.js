import {testHook} from "@fairspace/shared-frontend";
import {disconnectedUseUploads} from "../UseUploads";

const testUseUploads = (path, existingFilenames, uploads, dispatch) => {
    let uploadInfo;

    testHook(() => {
        uploadInfo = disconnectedUseUploads(path, existingFilenames, uploads, dispatch);
    });

    return uploadInfo;
};

describe('useUploads', () => {
    const dispatch = jest.fn();

    beforeEach(() => {
        dispatch.mockReset();
    });

    it('should enqueue a given file upload', () => {
        const uploads = testUseUploads('/', [], [], dispatch);

        uploads.enqueue([{name: 'test.txt'}]);

        expect(dispatch.mock.calls[0][0].uploads).toEqual([{
            file: {name: 'test.txt'},
            destinationFilename: 'test.txt',
            destinationPath: '/'
        }]);
    });

    it('should resolve naming conflicts with existing files', () => {
        const uploads = testUseUploads('/', ['test.txt'], [], dispatch);

        uploads.enqueue([{name: 'test.txt'}]);

        expect(dispatch.mock.calls[0][0].uploads).toEqual([{
            file: {name: 'test.txt'},
            destinationFilename: 'test (1).txt',
            destinationPath: '/'
        }]);
    });

    it('should resolve naming conflicts with previous uploads', () => {
        const uploads = testUseUploads('/', [], [{destinationFilename: 'test.txt'}], dispatch);

        uploads.enqueue([{name: 'test.txt'}]);

        expect(dispatch.mock.calls[0][0].uploads).toEqual([{
            file: {name: 'test.txt'},
            destinationFilename: 'test (1).txt',
            destinationPath: '/'
        }]);
    });
});
