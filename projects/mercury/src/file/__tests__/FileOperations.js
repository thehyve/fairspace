import React from 'react';
import {shallow} from "enzyme";
import {IconButton} from "@material-ui/core";

import {FileOperations} from "../FileOperations";
import {COPY, CUT} from "../../constants";

describe('FileOperations', () => {
    const clearSelection = jest.fn();
    const refreshFiles = jest.fn();

    let wrapper;
    let clickHandler;

    const clipboardMock = {
        method: COPY,
        filenames: ['a'],
        isEmpty: () => false,
        length: () => 1
    };

    const fileActionsMock = {
        getDownloadLink: () => 'http://a',
        createDirectory: () => Promise.resolve(),
        deleteMultiple: () => Promise.resolve(),
        copyPaths: () => new Promise(resolve => setTimeout(resolve, 500))
    };

    const renderFileOperations = (clipboard, fileActions, openedPath) => shallow(<FileOperations
        classes={{}}
        paste={() => Promise.resolve()}
        files={[{filename: 'a'}]}
        selectedPaths={['a']}
        clipboard={clipboard}
        fetchFilesIfNeeded={() => {}}
        getDownloadLink={() => {}}
        refreshFiles={refreshFiles}
        clearSelection={clearSelection}
        fileActions={fileActions}
        openedPath={openedPath}
        isWritingEnabled
        currentUser={{admin: true}}
    />);

    beforeEach(() => {
        clearSelection.mockReset();
        refreshFiles.mockReset();

        wrapper = renderFileOperations(clipboardMock, fileActionsMock);

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
                    .not('[showHistory]')
                    .forEach(b => {
                        expect(b.props().disabled).toBe(false);
                    });
            });
    });

    it('should clear selection and refresh files after all successful file operations', () => {
        const createDir = () => wrapper.find('CreateDirectoryButton').prop("onCreate")("some-dir");
        const paste = () => clickHandler('Paste')({stopPropagation: () => {}});
        const deleteFile = () => wrapper.find('[aria-label="Delete"]').parent().prop("onClick")();

        return Promise.all(
            [createDir, deleteFile, paste].map(op => {
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

    describe('paste button', () => {
        it('should be disabled if clipboard is empty', () => {
            const emptyClipboard = {
                method: COPY,
                filenames: [],
                isEmpty: () => true,
                length: () => 0
            };

            wrapper = renderFileOperations(emptyClipboard, fileActionsMock);
            expect(wrapper.find('[aria-label="Paste"]').prop("disabled")).toEqual(true);
        });
        it('should be disabled if the clipboard contains files cut from the current directory', () => {
            const openedPath = '/subdirectory';
            const currentDirClipboard = {
                method: CUT,
                filenames: ['/subdirectory/test.txt'],
                isEmpty: () => false,
                length: () => 1
            };

            wrapper = renderFileOperations(currentDirClipboard, fileActionsMock, openedPath);
            expect(wrapper.find('[aria-label="Paste"]').prop("disabled")).toEqual(true);
        });
        it('should be enabled if the clipboard contains files cut from the other directory', () => {
            const openedPath = '/other-directory';
            const currentDirClipboard = {
                method: CUT,
                filenames: ['/subdirectory/test.txt'],
                isEmpty: () => false,
                length: () => 1
            };

            wrapper = renderFileOperations(currentDirClipboard, fileActionsMock, openedPath);
            expect(wrapper.find('[aria-label="Paste"]').prop("disabled")).toEqual(false);
        });
        it('should be enabled if the clipboard contains files copied from the current directory', () => {
            const openedPath = '/subdirectory';
            const currentDirClipboard = {
                method: COPY,
                filenames: ['/subdirectory/test.txt'],
                isEmpty: () => false,
                length: () => 1
            };

            wrapper = renderFileOperations(currentDirClipboard, fileActionsMock, openedPath);
            expect(wrapper.find('[aria-label="Paste"]').prop("disabled")).toEqual(false);
        });
    });

    describe('undelete button', () => {
        const emptyClipboard = {
            method: COPY,
            filenames: [],
            isEmpty: () => true,
            length: () => 0
        };
        it('should not be shown if not in showDeleted mode', () => {
            const render = (fileActions) => shallow(<FileOperations
                classes={{}}
                paste={() => Promise.resolve()}
                files={[{filename: 'a'}]}
                selectedPaths={[]}
                fetchFilesIfNeeded={() => {}}
                getDownloadLink={() => {}}
                refreshFiles={refreshFiles}
                clearSelection={clearSelection}
                fileActions={fileActions}
                openedPath={{}}
                isWritingEnabled
                currentUser={{admin: true}}
                clipboard={emptyClipboard}
                showDeleted={false}
            />);

            wrapper = render(fileActionsMock);
            expect(wrapper.find('[aria-label="Undelete"]')).toEqual({});
        });
        it('should be disabled if no file selected', () => {
            const render = (fileActions) => shallow(<FileOperations
                classes={{}}
                paste={() => Promise.resolve()}
                files={[{filename: 'a'}]}
                selectedPaths={[]}
                fetchFilesIfNeeded={() => {}}
                getDownloadLink={() => {}}
                refreshFiles={refreshFiles}
                clearSelection={clearSelection}
                fileActions={fileActions}
                openedPath={{}}
                isWritingEnabled
                currentUser={{admin: true}}
                clipboard={emptyClipboard}
                showDeleted
            />);

            wrapper = render(fileActionsMock);
            expect(wrapper.find('[aria-label="Undelete"]').prop("disabled")).toEqual(true);
        });
        it('should be disabled if non-deleted file selected', () => {
            const render = (fileActions) => shallow(<FileOperations
                classes={{}}
                paste={() => Promise.resolve()}
                files={[{filename: 'a'}]}
                selectedPaths={['a']}
                fetchFilesIfNeeded={() => {}}
                getDownloadLink={() => {}}
                refreshFiles={refreshFiles}
                clearSelection={clearSelection}
                fileActions={fileActions}
                openedPath={{}}
                isWritingEnabled
                currentUser={{admin: true}}
                clipboard={emptyClipboard}
                showDeleted
            />);

            wrapper = render(fileActionsMock);
            expect(wrapper.find('[aria-label="Undelete"]').prop("disabled")).toEqual(true);
        });
        it('should be enabled if deleted file selected', () => {
            const render = (fileActions) => shallow(<FileOperations
                classes={{}}
                paste={() => Promise.resolve()}
                files={[{filename: 'a', dateDeleted: '08-06-2020'}]}
                selectedPaths={['a']}
                fetchFilesIfNeeded={() => {}}
                getDownloadLink={() => {}}
                refreshFiles={refreshFiles}
                clearSelection={clearSelection}
                fileActions={fileActions}
                openedPath={{}}
                isWritingEnabled
                currentUser={{admin: true}}
                clipboard={emptyClipboard}
                showDeleted
            />);

            wrapper = render(fileActionsMock);
            expect(wrapper.find('[aria-label="Undelete"]').prop("disabled")).toEqual(false);
        });
    });
});
