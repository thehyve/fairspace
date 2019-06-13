import React from 'react';
import {shallow} from "enzyme";
import {FileOperations} from "../FileOperations";

describe('FileOperations', () => {
    it('Resolves naming conflicts on upload', () => {
        const uploadFiles = jest.fn(() => Promise.resolve());
        const onFileOperation = jest.fn((op) => op);

        const wrapper = shallow(<FileOperations
            classes={{}}
            selectedPaths={[]}
            uploadFiles={uploadFiles}
            openedPath="opened/Path"
            existingFiles={['file1.txt', 'file2.txt', 'file2 (1).txt', 'file2 (2).txt']}
            getDownloadLink={() => {}}
            onFileOperation={onFileOperation}
        />);

        const files = [{name: 'file1.txt'}, {name: 'file2.txt'}, {name: 'file3.txt'}];
        return wrapper.instance().handleUpload(files)
            .then(() => {
                expect(uploadFiles.mock.calls.length).toEqual(1);
                expect(uploadFiles.mock.calls[0][0]).toEqual('opened/Path');
                expect(uploadFiles.mock.calls[0][1]).toEqual(
                    [{
                        name: "file1 (1).txt",
                        value: {name: "file1.txt"}
                    },
                    {
                        name: "file2 (3).txt",
                        value: {name: "file2.txt"}
                    },
                    {
                        name: "file3.txt",
                        value: {name: "file3.txt"}
                    }]
                );
                expect(onFileOperation.mock.calls.length).toEqual(1);
                expect(onFileOperation.mock.calls[0][0]).toEqual(uploadFiles());
            });
    });
});

describe('handleCreateDirectory', () => {
    it('should return false for 405 error', () => {
        const createDirectory = jest.fn(() => Promise.reject(new Error({response: {status: 405}})));
        const instance = shallow(
            <FileOperations
                selectedPaths={[]}
                createDirectory={createDirectory}
                classes={{}}
                getDownloadLink={() => {}}
                onFileOperation={op => op}
            />
        ).instance();

        instance.handleCreateDirectory()
            .then(result => {
                expect(result).toEqual(false);
            });
    });
});
