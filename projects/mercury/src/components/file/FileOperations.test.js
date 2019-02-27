import React from 'react';
import {shallow} from "enzyme";
import {FileOperations} from "./FileOperations";

describe('FileOperations', () => {
    it('Resolves naming conflicts on upload', () => {
        const uploadFiles = jest.fn(() => Promise.resolve());

        const wrapper = shallow(<FileOperations
            selectedPaths={[]}
            uploadFiles={uploadFiles}
            openedPath="opened/Path"
            existingFiles={['file1.txt', 'file2.txt', 'file2 (1).txt', 'file2 (2).txt']}
        />);

        const files = [{name: 'file1.txt'}, {name: 'file2.txt'}, {name: 'file3.txt'}];

        wrapper.instance().handleUpload(files);

        expect(uploadFiles.mock.calls.length).toEqual(1);
        expect(uploadFiles.mock.calls[0][0]).toEqual('opened/Path');
        expect(uploadFiles.mock.calls[0][1]).toEqual(files);
        expect(uploadFiles.mock.calls[0][2]).toEqual(new Map([
            ["file1.txt", "file1 (1).txt"],
            ["file2.txt", "file2 (3).txt"],
            ["file3.txt", "file3.txt"]]));
    });
});
