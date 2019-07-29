import React from 'react';
import {shallow} from "enzyme";
import {IconButton} from "@material-ui/core";

import {FileOperations} from "../FileOperations";

describe('FileOperations', () => {
    it('Resolves naming conflicts on upload', () => {
        const uploadFiles = jest.fn(() => Promise.resolve());
        const fetchFilesIfNeeded = jest.fn();

        const wrapper = shallow(<FileOperations
            classes={{}}
            selectedPaths={[]}
            uploadFiles={uploadFiles}
            fetchFilesIfNeeded={fetchFilesIfNeeded}
            openedPath="opened/Path"
            existingFiles={['file1.txt', 'file2.txt', 'file2 (1).txt', 'file2 (2).txt']}
            getDownloadLink={() => {}}
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
                expect(fetchFilesIfNeeded.mock.calls.length).toEqual(1);
                expect(fetchFilesIfNeeded.mock.calls[0][0]).toEqual('opened/Path');
            });
    });

    it('should disable all buttons on file operation', () => {
        const wrapper = shallow(<FileOperations
            classes={{}}
            paste={() => Promise.resolve()}
            fetchFilesIfNeeded={() => {}}
            getDownloadLink={() => {}}
        />);

        wrapper.instance().handlePaste({stopPropagation: () => {}});

        wrapper.find(IconButton)
            .forEach(b => {
                expect(b.props().disabled).toBe(true);
            });
    });

    it('should enable all buttons after successful file operation', () => {
        const wrapper = shallow(<FileOperations
            classes={{}}
            paste={() => Promise.resolve()}
            fetchFilesIfNeeded={() => {}}
            getDownloadLink={() => {}}
        />);

        return wrapper.instance().handlePaste({stopPropagation: () => {}})
            .then(() => {
                wrapper.find(IconButton)
                    .not('[download]')
                    .forEach(b => {
                        expect(b.props().disabled).toBe(false);
                    });
            });
    });
});
