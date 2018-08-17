import FileStore from "./FileStore";
import Config from "../../components/generic/Config/Config";

const mockResponse = (status, statusText, response) => {
    return new window.Response(response, {
        status: status,
        statusText: statusText,
        headers: {
            'Content-type': 'application/json'
        }
    });
};

beforeAll(() => {
    Config.setConfig({
        "urls": {
            "files": "/files"
        }
    });

    return Config.init();
});

it('uses the collection name in the webdav path', () => {
    const fileStore = new FileStore('subdir')
    expect(fileStore.getFullPath('/filename')).toEqual('/subdir/filename');
    expect(fileStore.getFullPath()).toEqual('/subdir');
})

it('is capable of removing the collection name from a path', () => {
    const fileStore = new FileStore('subdir')
    expect(fileStore.getPathWithinCollection('/subdir/filename')).toEqual('/filename');
    expect(fileStore.getPathWithinCollection('/subdir')).toEqual('');
})

if('uploads multiple files', () => {
    const fileStore = new FileStore('subdir')
    fileStore.client = {putFileContents: jest.fn(() => Promise.resolve())};

    const result = fileStore.upload([{name: 'filea.txt'}, {name: 'fileb.txt'}, {name: 'filec.txt'}]);
    expect(result).resolves;
    expect(fileStore.client.putFileContents.mock.calls.length).toEqual(3);
});