import React from 'react';
import {shallow} from "enzyme";
import {IconButton} from "@material-ui/core";

import {FileOperations} from "../FileOperations";
import {CUT} from "../../constants";

describe('FileOperations', () => {
    const clearSelection = jest.fn();
    const refreshFiles = jest.fn();

    let wrapper;
    let clickHandler;

    beforeEach(() => {
        clearSelection.mockReset();
        refreshFiles.mockReset();

        const clipboardMock = {
            method: CUT,
            filenames: ['a'],
            isEmpty: () => false,
            length: () => 1
        };

        const fileActionsMock = {
            getDownloadLink: () => 'http://a',
            createDirectory: () => Promise.resolve(),
            renameFile: () => Promise.resolve(),
            deleteMultiple: () => Promise.resolve(),
            movePaths: () => new Promise(resolve => setTimeout(resolve, 500))
        };

        wrapper = shallow(<FileOperations
            classes={{}}
            paste={() => Promise.resolve()}
            files={[{filename: 'a'}]}
            selectedPaths={['a']}
            clipboard={clipboardMock}
            fetchFilesIfNeeded={() => {}}
            getDownloadLink={() => {}}
            refreshFiles={refreshFiles}
            clearSelection={clearSelection}
            fileActions={fileActionsMock}
        />);

        clickHandler = ariaLabel => wrapper.find('[aria-label="' + ariaLabel + '"]').prop("onClick");
    });

    it('should disable all buttons on when file operation is not finished yet', () => {

        clickHandler('Paste')({stopPropagation: () => {}});

        wrapper.find(IconButton)
            .forEach(b => {
                expect(b.props().disabled).toBe(true);
            });
    });

    // eslint-disable-next-line arrow-body-style
    it('should enable all buttons after successful file operation', () => {
        return clickHandler('Paste')({stopPropagation: () => {}})
            .then(() => {
                wrapper.find(IconButton)
                    .not('[download]')
                    .forEach(b => {
                        expect(b.props().disabled).toBe(false);
                    });
            });
    });

    it('should clear selection and refresh files after all successful file operations', async () => {
        const createDir = () => wrapper.find('CreateDirectoryButton').prop("onCreate")("some-dir");
        const renameFile = () => wrapper.find('RenameButton').prop("onRename")("new-name");
        const deleteFile = () => wrapper.find('[aria-label="Delete"]').parent().prop("onClick")();
        const paste = () => clickHandler('Paste')({stopPropagation: () => {}});

        await Promise.all(
            [createDir, renameFile, deleteFile, paste].map(op => {
                refreshFiles.mockReset();
                clearSelection.mockReset();

                return op()
                    .then(() => {
                        expect(refreshFiles).toHaveBeenCalled();
                        expect(clearSelection).toHaveBeenCalled();
                    })
                    .catch(() => {
                        throw Error("Operation failed: ", op.name);
                    });
            })
        );
    });
});
