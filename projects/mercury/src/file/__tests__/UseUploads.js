import {testHook} from "../../common";
import {disconnectedUseUploads} from "../UseUploads";

const testUseUploads = (path, existingFilenames, uploads, dispatch) => {
    let uploadInfo;

    testHook(() => {
        uploadInfo = disconnectedUseUploads(path, existingFilenames, uploads, dispatch);
    });

    return uploadInfo;
};

describe('useUploads', () => {
    const enqueueUploads = jest.fn();
    const startUpload = jest.fn();

    beforeEach(() => {
        enqueueUploads.mockReset();
        startUpload.mockReset();
    });

    it('should enqueue a given file upload', () => {
        const uploads = testUseUploads('/', [], [], enqueueUploads, startUpload);

        uploads.enqueue([{name: 'test.txt'}]);

        expect(enqueueUploads).toHaveBeenCalledTimes(1);
        expect(enqueueUploads).toHaveBeenCalledWith(
            expect.arrayContaining([
                {
                    destinationFilename: "test.txt",
                    destinationPath: "/",
                    file: {
                        name: "test.txt",
                    },
                },
            ])
        );
    });

    it('should resolve naming conflicts with existing files', () => {
        const uploads = testUseUploads('/', ['test.txt'], [], enqueueUploads, startUpload);

        uploads.enqueue([{name: 'test.txt'}]);

        expect(enqueueUploads).toHaveBeenCalledTimes(1);
        expect(enqueueUploads).toHaveBeenCalledWith(
            expect.arrayContaining([
                {
                    file: {name: 'test.txt'},
                    destinationFilename: 'test (1).txt',
                    destinationPath: '/'
                }
            ])
        );
    });

    it('should resolve naming conflicts with previous uploads', () => {
        const uploads = testUseUploads('/', [], [{destinationPath: '/', destinationFilename: 'test.txt'}], enqueueUploads, startUpload);

        uploads.enqueue([{name: 'test.txt'}]);

        expect(enqueueUploads).toHaveBeenCalledTimes(1);
        expect(enqueueUploads).toHaveBeenCalledWith(
            expect.arrayContaining([
                {
                    file: {name: 'test.txt'},
                    destinationFilename: 'test (1).txt',
                    destinationPath: '/'
                }
            ])
        );
    });

    it('should only work on uploads in the given path', () => {
        const allUploads = [
            {
                destinationPath: '/test',
                file: {name: 'not-included.txt'}
            },
            {
                destinationPath: '/',
                file: {name: 'included.txt'}
            },
            {
                destinationPath: '/subdirectory/',
                file: {name: 'not-included.txt'}
            },
        ];
        const uploads = testUseUploads('/', [], allUploads, enqueueUploads, startUpload);

        expect(uploads.uploads).toEqual([
            {
                destinationPath: '/',
                file: {name: 'included.txt'}
            }
        ]);
    });
});
