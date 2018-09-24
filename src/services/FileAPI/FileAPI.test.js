import FileAPI from "./FileAPI";
import Config from "../../components/generic/Config/Config";

beforeAll(() => {
    Config.setConfig({
        "urls": {
            "files": "/files"
        }
    });

    return Config.init();
});

it('uses the collection name in the webdav path', () => {
    const fileAPI = new FileAPI('subdir')
    expect(fileAPI.getFullPath('/filename')).toEqual('/subdir/filename');
    expect(fileAPI.getFullPath()).toEqual('/subdir');
})

if('uploads multiple files', () => {
    const fileAPI = new FileAPI('subdir')
    fileAPI.client = {putFileContents: jest.fn(() => Promise.resolve())};

    const result = fileAPI.upload([{name: 'filea.txt'}, {name: 'fileb.txt'}, {name: 'filec.txt'}]);
    expect(result).resolves;
    expect(fileAPI.client.putFileContents.mock.calls.length).toEqual(3);
});
