/* eslint-disable prefer-promise-reject-errors */
import FileAPI from "../FileAPI";

describe('FileAPI', () => {
    describe('Uploading', () => {
        it('uploads a file', async () => {
            FileAPI.webDavClient = {putFileContents: jest.fn(() => Promise.resolve({}))};
            const file = {file: 'FILE_OBJECT', destinationFilename: 'destination.txt', destinationPath: '/test/path'};
            const result = await FileAPI.upload(file);

            expect(result).toEqual({});
            expect(FileAPI.webDavClient.putFileContents).toHaveBeenCalledTimes(1);
            expect(FileAPI.webDavClient.putFileContents)
                .toHaveBeenCalledWith('/test/path/destination.txt', 'FILE_OBJECT', expect.anything());
        });

        it('should result in a clear error on 403 response', () => {
            FileAPI.webDavClient = {putFileContents: jest.fn(() => Promise.reject({response: {status: 403}}))};
            const file = {file: 'FILE_OBJECT', destinationFilename: 'destination.txt', destinationPath: '/test/path'};

            return expect(FileAPI.upload(file))
                .rejects.toThrow(/authorization to add/);
        });
    });

    describe('Moving', () => {
        it('ignores cut-and-paste into same folder', async () => {
            FileAPI.webDavClient = {moveFile: jest.fn(() => Promise.resolve())};

            await FileAPI.move('/coll/path/file.ext', '/coll/path/file.ext');

            expect(FileAPI.webDavClient.moveFile).toHaveBeenCalledTimes(0);
        });

        it('should result in a clear error on 400 response', () => {
            FileAPI.webDavClient = {moveFile: jest.fn(() => Promise.reject({response: {status: 400}}))};

            return expect(FileAPI.move("/test", "special-characters"))
                .rejects.toThrow(/contains special characters/);
        });

        it('should result in a clear error on 403 response', () => {
            FileAPI.webDavClient = {moveFile: jest.fn(() => Promise.reject({response: {status: 403}}))};

            return expect(FileAPI.move("/test", "special-characters"))
                .rejects.toThrow(/write permission/);
        });

        it('should result in a clear error on 409 response', () => {
            FileAPI.webDavClient = {moveFile: jest.fn(() => Promise.reject({response: {status: 409}}))};

            return expect(FileAPI.move("/test", "special-characters"))
                .rejects.toThrow(/destination can not be copied to/);
        });

        it('should result in a clear error on 412 response', () => {
            FileAPI.webDavClient = {moveFile: jest.fn(() => Promise.reject({response: {status: 412}}))};

            return expect(FileAPI.move("/test", "special-characters"))
                .rejects.toThrow(/already exists/);
        });
    });

    describe('Deleting', () => {
        it('should result in a clear error on 403 response', () => {
            FileAPI.webDavClient = {deleteFile: jest.fn(() => Promise.reject({response: {status: 403}}))};

            return expect(FileAPI.delete('path'))
                .rejects.toThrow(/write permissions/);
        });
    });

    describe('uniqueDestinationPaths', () => {
        it('generates unique names', async () => {
            FileAPI.list = jest.fn(() => Promise.resolve([{basename: 'file.ext'}, {basename: 'file (1).ext'}, {basename: 'file (2).ext'}]));
            const result = await FileAPI.uniqueDestinationPaths(['/src/file.ext', '/src/file (2).ext'], '/dst');

            expect(result).toEqual([
                ['/src/file.ext', '/dst/file (3).ext'],
                ['/src/file (2).ext', '/dst/file (2) (1).ext']]);
        });

        it('leaves already unique names untouched', async () => {
            FileAPI.list = jest.fn(() => Promise.resolve([{basename: 'file.ext'}]));
            const result = await FileAPI.uniqueDestinationPaths(['/src/new.ext'], '/dst');

            expect(result).toEqual([['/src/new.ext', '/dst/new.ext']]);
        });

        it('handles multiple files with smae name', async () => {
            FileAPI.list = jest.fn(() => Promise.resolve([{basename: 'file.ext'}]));
            const result = await FileAPI.uniqueDestinationPaths(['/src1/file.ext', '/src2/file.ext'], '/dst');

            expect(result).toEqual([['/src1/file.ext', '/dst/file (1).ext'], ['/src2/file.ext', '/dst/file (2).ext']]);
        });
    });

    describe('createDirectory', () => {
        it('should result in clear error on 400 response', () => {
            FileAPI.webDavClient = {createDirectory: jest.fn(() => Promise.reject({response: {status: 400}}))};

            return expect(FileAPI.createDirectory("/test"))
                .rejects.toThrow(/contain special characters/);
        });

        it('should result in clear error on 403 response', () => {
            FileAPI.webDavClient = {createDirectory: jest.fn(() => Promise.reject({response: {status: 403}}))};

            return expect(FileAPI.createDirectory("/test"))
                .rejects.toThrow(/authorization to create/);
        });

        it('should result in clear error on 405 response', () => {
            FileAPI.webDavClient = {createDirectory: jest.fn(() => Promise.reject({response: {status: 405}}))};

            return expect(FileAPI.createDirectory("/test"))
                .rejects.toThrow(/already exists/);
        });
    });

    it('Generates proper download link', () => {
        const downloadLink = FileAPI.getDownloadLink('/filePath');
        expect(downloadLink).toEqual('webdav/filePath');
    });
});
