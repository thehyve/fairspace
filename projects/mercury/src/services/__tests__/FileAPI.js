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

it('generates unique names', () => {
    FileAPI.list = jest.fn(() => Promise.resolve([{basename: 'file.ext'}, {basename: 'file (1).ext'}, {basename: 'file (2).ext'}]));
    return FileAPI.uniqueDestinationPaths(['/coll/src/file.ext'], '/coll/dst')
        .then(result => expect(result).toEqual([['/coll/src/file.ext', '/coll/dst/file (3).ext']]));
});
