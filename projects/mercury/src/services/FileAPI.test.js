import FileAPI from "./FileAPI";
import Config from "./Config/Config";

beforeAll(() => {
    Config.setConfig({
        urls: {
            files: "/files"
        }
    });

    return Config.init();
});

it('uses the collection name in the webdav path', () => {
    const fileAPI = new FileAPI('subdir');
    expect(fileAPI.getFullPath('/filename')).toEqual('/subdir/filename');
    expect(fileAPI.getFullPath()).toEqual('/subdir');
});

it('uploads multiple files', () => {
    const fileAPI = new FileAPI('subdir');
    fileAPI.client = {putFileContents: jest.fn(() => Promise.resolve())};
    const files = [{name: 'filea.txt'}, {name: 'fileb.txt'}, {name: 'filec.txt'}];

    const result = fileAPI.upload('', files, new Map());
    expect(result).resolves.toEqual(files);
    expect(fileAPI.client.putFileContents.mock.calls.length).toEqual(3);
});
