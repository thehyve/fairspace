import FileAPI from "../FileAPI";
import Config from "../Config/Config";

beforeAll(() => {
    Config.setConfig({
        urls: {
            files: "/files"
        }
    });

    return Config.init();
});


it('uploads multiple files', () => {
    FileAPI.webDavClient = {putFileContents: jest.fn(() => Promise.resolve())};
    const files = [{name: 'filea.txt'}, {name: 'fileb.txt'}, {name: 'filec.txt'}];

    const result = FileAPI.upload('', files, new Map());
    expect(result).resolves.toEqual(files);
    expect(FileAPI.webDavClient.putFileContents.mock.calls.length).toEqual(3);
});

it('ignores cut-and-paste into same folder', () => {
    FileAPI.webDavClient = {moveFile: jest.fn(() => Promise.resolve())};
    FileAPI.move('/coll/path/file.ext', '/coll/path/file.ext')
        .then(() => expect(FileAPI.webDavClient.moveFile.mock.calls.length).toEqual(0));
});


describe('uniqueDestinationPaths', () => {
    it('generates unique names', () => {
        FileAPI.list = jest.fn(() => Promise.resolve([{basename: 'file.ext'}, {basename: 'file (1).ext'}, {basename: 'file (2).ext'}]));
        return FileAPI.uniqueDestinationPaths(['/src/file.ext', '/src/file (2).ext'], '/dst')
            .then(result => expect(result).toEqual([
                ['/src/file.ext', '/dst/file (3).ext'],
                ['/src/file (2).ext', '/dst/file (2) (1).ext']]));
    });

    it('leaves already unique names untouched', () => {
        FileAPI.list = jest.fn(() => Promise.resolve([{basename: 'file.ext'}]));
        return FileAPI.uniqueDestinationPaths(['/src/new.ext'], '/dst')
            .then(result => expect(result).toEqual([['/src/new.ext', '/dst/new.ext']]));
    });

    it('handles multiple files with smae name', () => {
        FileAPI.list = jest.fn(() => Promise.resolve([{basename: 'file.ext'}]));
        return FileAPI.uniqueDestinationPaths(['/src1/file.ext', '/src2/file.ext'], '/dst')
            .then(result => expect(result).toEqual([['/src1/file.ext', '/dst/file (1).ext'], ['/src2/file.ext', '/dst/file (2).ext']]));
    });
});

describe('createDirectory', () => {
    it('should result in clear error on 405 response', () => {
        // eslint-disable-next-line prefer-promise-reject-errors
        FileAPI.webDavClient = {createDirectory: jest.fn(() => Promise.reject({response: {status: 405}}))};

        return expect(FileAPI.createDirectory("/test")).rejects.toEqual(new Error("A directory or file with this name already exists. Please choose another name"));
    });
});
