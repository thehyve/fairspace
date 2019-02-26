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


it('uploads multiple files', () => {
    FileAPI.webDavClient = {putFileContents: jest.fn(() => Promise.resolve())};
    const files = [{name: 'filea.txt'}, {name: 'fileb.txt'}, {name: 'filec.txt'}];

    const result = FileAPI.upload('', files, new Map());
    expect(result).resolves.toEqual(files);
    expect(FileAPI.webDavClient.putFileContents.mock.calls.length).toEqual(3);
});
