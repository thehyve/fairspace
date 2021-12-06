import {LocalFileAPI} from "../FileAPI";

/* eslint-disable prefer-promise-reject-errors */
describe('FileAPI', () => {
    describe('Retrieving', () => {
        it('retrieves files', async () => {
            const getDirectoryContents = jest.fn(() => Promise.resolve(
                {data: [{basename: 'file.ext'}, {basename: 'file (1).ext'}, {basename: 'file (2).ext'}]}
            ));
            LocalFileAPI.client = () => ({getDirectoryContents});
            const result = await LocalFileAPI.list('/src');

            expect(result).toEqual([{basename: 'file.ext'}, {basename: 'file (1).ext'}, {basename: 'file (2).ext'}]);
            expect(getDirectoryContents).toHaveBeenCalledTimes(1);
            expect(getDirectoryContents).toHaveBeenCalledWith(
                '/src',
                {details: true, headers: {"X-Requested-With": "XMLHttpRequest"}, withCredentials: true, data: '<propfind><allprop /></propfind>'}
            );
        });

        it('retrieves files including deleted', async () => {
            const getDirectoryContents = jest.fn(() => Promise.resolve(
                {data: [{basename: 'file.ext'}, {basename: 'file (1).ext'}, {basename: 'file (2).ext'}]}
            ));
            LocalFileAPI.client = () => ({getDirectoryContents});
            const result = await LocalFileAPI.list('/src', true);

            expect(result).toEqual([{basename: 'file.ext'}, {basename: 'file (1).ext'}, {basename: 'file (2).ext'}]);
            expect(getDirectoryContents).toHaveBeenCalledTimes(1);
            expect(getDirectoryContents).toHaveBeenCalledWith(
                '/src',
                {
                    details: true,
                    headers: {"Show-Deleted": "on", "X-Requested-With": "XMLHttpRequest"},
                    withCredentials: true,
                    data: "<propfind><allprop /></propfind>"
                }
            );
        });
    });

    describe('Moving', () => {
        it('ignores cut-and-paste into same folder', async () => {
            const moveFile = jest.fn(() => Promise.resolve());
            LocalFileAPI.client = () => ({moveFile});

            await LocalFileAPI.move('/coll/path/file.ext', '/coll/path/file.ext');

            expect(moveFile).toHaveBeenCalledTimes(0);
        });

        it('should result in a clear error on 400 response', () => {
            const moveFile = jest.fn(() => Promise.reject({response: {status: 400}}));
            LocalFileAPI.client = () => ({moveFile});

            return expect(LocalFileAPI.move("/test", "special-characters"))
                .rejects.toThrow(/contains special characters/);
        });
    });

    describe('Copying', () => {
        it('should result in a clear error on 403 response', () => {
            const copyFile = jest.fn(() => Promise.reject({response: {status: 403}}));
            LocalFileAPI.client = () => ({copyFile});

            return expect(LocalFileAPI.copy("/test", "special-characters"))
                .rejects.toThrow(/write permission/);
        });

        it('should result in a clear error on 409 response', () => {
            const copyFile = jest.fn(() => Promise.reject({response: {status: 409}}));
            LocalFileAPI.client = () => ({copyFile});

            return expect(LocalFileAPI.copy("/test", "special-characters"))
                .rejects.toThrow(/destination can not be copied to/);
        });

        it('should result in a clear error on 412 response', () => {
            const copyFile = jest.fn(() => Promise.reject({response: {status: 412}}));
            LocalFileAPI.client = () => ({copyFile});

            return expect(LocalFileAPI.copy("/test", "special-characters"))
                .rejects.toThrow(/already exists/);
        });
    });

    describe('Deleting', () => {
        it('should result in a clear error on 403 response', () => {
            LocalFileAPI.client = () => ({deleteFile: jest.fn(() => Promise.reject({response: {status: 403}}))});

            return expect(LocalFileAPI.delete('path'))
                .rejects.toThrow(/Only admins can delete/);
        });

        it('deletes files', async () => {
            const deleteFile = jest.fn(() => Promise.resolve({}));
            LocalFileAPI.client = () => ({deleteFile});
            await LocalFileAPI.deleteMultiple(['/src']);

            expect(deleteFile).toHaveBeenCalledTimes(1);
            expect(deleteFile).toHaveBeenCalledWith('/src', {headers: {"X-Requested-With": "XMLHttpRequest"}, withCredentials: true});
        });

        it('deletes files permanently', async () => {
            const deleteFile = jest.fn(() => Promise.resolve({}));
            LocalFileAPI.client = () => ({deleteFile});
            await LocalFileAPI.deleteMultiple(['/src'], true);

            expect(deleteFile).toHaveBeenCalledTimes(1);
            expect(deleteFile).toHaveBeenCalledWith(
                '/src', {headers: {"X-Requested-With": "XMLHttpRequest", "Show-Deleted": "on"}, withCredentials: true}
            );
        });
    });

    describe('uniqueDestinationPaths', () => {
        it('generates unique names', async () => {
            LocalFileAPI.list = jest.fn(() => Promise.resolve([{basename: 'file.ext'}, {basename: 'file (1).ext'}, {basename: 'file (2).ext'}]));
            const result = await LocalFileAPI.uniqueDestinationPaths(['/src/file.ext', '/src/file (2).ext'], '/dst');

            expect(result).toEqual([
                ['/src/file.ext', '/dst/file (3).ext'],
                ['/src/file (2).ext', '/dst/file (2) (1).ext']]);
        });

        it('leaves already unique names untouched', async () => {
            LocalFileAPI.list = jest.fn(() => Promise.resolve([{basename: 'file.ext'}]));
            const result = await LocalFileAPI.uniqueDestinationPaths(['/src/new.ext'], '/dst');

            expect(result).toEqual([['/src/new.ext', '/dst/new.ext']]);
        });

        it('handles multiple files with smae name', async () => {
            LocalFileAPI.list = jest.fn(() => Promise.resolve([{basename: 'file.ext'}]));
            const result = await LocalFileAPI.uniqueDestinationPaths(['/src1/file.ext', '/src2/file.ext'], '/dst');

            expect(result).toEqual([['/src1/file.ext', '/dst/file (1).ext'], ['/src2/file.ext', '/dst/file (2).ext']]);
        });
    });

    describe('Creating directory', () => {
        it('should result in clear error on 400 response', () => {
            LocalFileAPI.client = () => ({createDirectory: () => Promise.reject({response: {status: 400}})});

            return expect(LocalFileAPI.createDirectory("/test"))
                .rejects.toThrow(/contain special characters/);
        });

        it('should result in clear error on 403 response', () => {
            LocalFileAPI.client = () => ({createDirectory: () => Promise.reject({response: {status: 403}})});

            return expect(LocalFileAPI.createDirectory("/test"))
                .rejects.toThrow(/authorization to create/);
        });

        it('should result in clear error on 405 response', () => {
            LocalFileAPI.client = () => ({createDirectory: () => Promise.reject({response: {status: 405}})});

            return expect(LocalFileAPI.createDirectory("/test"))
                .rejects.toThrow(/already exists/);
        });
    });

    describe('Showing history', () => {
        it('shows file history', async () => {
            const file = {filename: '/f1', version: 5};
            const stat = jest.fn(() => Promise.resolve(
                {data: file}
            ));
            LocalFileAPI.client = () => ({stat});

            await LocalFileAPI.showFileHistory(file, 1, 5);

            expect(stat).toHaveBeenCalledTimes(4);
            expect(stat).toHaveBeenCalledWith('/f1', {
                withCredentials: true,
                data: "<propfind><allprop /></propfind>",
                details: true,
                headers: {
                    "Version": 4,
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
            expect(stat).toHaveBeenCalledWith('/f1', {
                withCredentials: true,
                data: "<propfind><allprop /></propfind>",
                details: true,
                headers: {
                    "Version": 3,
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
            expect(stat).toHaveBeenCalledWith('/f1', {
                withCredentials: true,
                data: "<propfind><allprop /></propfind>",
                details: true,
                headers: {
                    "Version": 2,
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
            expect(stat).toHaveBeenCalledWith('/f1', {
                withCredentials: true,
                data: "<propfind><allprop /></propfind>",
                details: true,
                headers: {
                    "Version": 1,
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
        });

        it('shows only limited number of file versions', async () => {
            const file = {filename: '/f1', version: 297};
            const stat = jest.fn(() => Promise.resolve(Promise.resolve(
                {data: file}
            )));
            LocalFileAPI.client = () => ({stat});
            await LocalFileAPI.showFileHistory(file, 1, 11);

            expect(stat).toHaveBeenCalledTimes(11);
            expect(stat).toHaveBeenCalledWith('/f1', {
                withCredentials: true,
                data: "<propfind><allprop /></propfind>",
                details: true,
                headers: {
                    "Version": 296,
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
            expect(stat).toHaveBeenCalledWith('/f1', {
                withCredentials: true,
                data: "<propfind><allprop /></propfind>",
                details: true,
                headers: {
                    "Version": 287,
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
        });
    });
});
