import React, {useState} from 'react';
import {Badge, Icon, IconButton} from "@material-ui/core";
import ContentCopy from "mdi-material-ui/ContentCopy";
import ContentCut from "mdi-material-ui/ContentCut";
import ContentPaste from "mdi-material-ui/ContentPaste";
import Download from "mdi-material-ui/Download";
import {ConfirmationButton, ErrorDialog} from "@fairspace/shared-frontend";

import {ProgressButton} from '../common/components';
import {CreateDirectoryButton, RenameButton} from "./buttons";
import {getParentPath, joinPaths} from "../common/utils/fileUtils";
import {COPY, CUT} from '../constants';
import FileOperationsGroup from "./FileOperationsGroup";
import useClipboard from "../common/hooks/useClipboard";

export const Operations = {
    PASTE: 'PASTE',
    RENAME: 'RENAME',
    MKDIR: 'MKDIR',
    DELETE: 'DELETE'
};
Object.freeze(Operations);

export const FileOperations = ({
    isWritingDisabled,
    openedPath,
    selectedPaths,
    clearSelection,
    fileActions = {},

    files,
    refreshFiles,
    clipboard
}) => {
    const [activeOperation, setActiveOperation] = useState();
    const busy = !!activeOperation;

    const noPathSelected = selectedPaths.length === 0;
    const selectedItems = files.filter(f => selectedPaths.includes(f.filename)) || [];
    const selectedItem = selectedItems && selectedItems.length === 1 ? selectedItems[0] : {};
    const moreThanOneItemSelected = selectedPaths.length > 1;
    const isDisabledForMoreThanOneSelection = selectedPaths.length === 0 || moreThanOneItemSelected;
    const isClipboardItemsOnOpenedPath = !clipboard.isEmpty() && clipboard.filenames.map(f => getParentPath(f)).includes(openedPath);
    const isPasteDisabled = isWritingDisabled || clipboard.isEmpty() || (isClipboardItemsOnOpenedPath && clipboard.method === CUT);

    const fileOperation = (operationCode, operationPromise) => {
        setActiveOperation(operationCode);
        return operationPromise
            .then(r => {
                setActiveOperation();
                refreshFiles();
                clearSelection();
                return r;
            })
            .catch(e => {
                setActiveOperation();
                return Promise.reject(e);
            });
    };

    const handleCut = e => {
        if (e) e.stopPropagation();
        clipboard.cut(selectedPaths);
    };

    const handleCopy = e => {
        if (e) e.stopPropagation();
        clipboard.copy(selectedPaths);
    };

    const handlePaste = e => {
        if (e) e.stopPropagation();

        let operation;

        if (clipboard.method === CUT) {
            operation = fileActions.movePaths(clipboard.filenames);
        } if (clipboard.method === COPY) {
            operation = fileActions.copyPaths(clipboard.filenames);
        }

        if (operation) {
            return fileOperation(Operations.PASTE, operation)
                .then(clipboard.clear)
                .catch((err) => {
                    ErrorDialog.showError(err, err.message || "An error occurred while pasting your contents");
                });
        }

        return Promise.resolve();
    };

    const handleCreateDirectory = name => fileOperation(Operations.MKDIR, fileActions.createDirectory(joinPaths(openedPath, name)))
        .catch((err) => {
            ErrorDialog.showError(err, err.message || "An error occurred while creating directory", () => handleCreateDirectory(name));
            return true;
        });

    const handleDelete = () => fileOperation(Operations.DELETE, fileActions.deleteMultiple(selectedPaths))
        .catch((err) => {
            ErrorDialog.showError(err, err.message || "An error occurred while deleting file or directory", () => handleDelete());
        });

    const handlePathRename = (path, newName) => fileOperation(Operations.RENAME, fileActions.renameFile(path.basename, newName))
        .catch((err) => {
            ErrorDialog.showError(err, err.message || "An error occurred while renaming file or directory", () => handlePathRename(path, newName));
            return false;
        });

    const addBadgeIfNotEmpty = (badgeContent, children) => {
        if (badgeContent) {
            return (
                <Badge badgeContent={badgeContent} color="primary">
                    {children}
                </Badge>
            );
        }
        return children;
    };

    return (
        <>
            <FileOperationsGroup>
                <ProgressButton active={activeOperation === Operations.MKDIR}>
                    <CreateDirectoryButton
                        onCreate={name => handleCreateDirectory(name)}
                        disabled={isWritingDisabled || busy}
                    >
                        <IconButton
                            aria-label="Create directory"
                            title="Create directory"
                            disabled={isWritingDisabled || busy}
                        >
                            <Icon>create_new_folder</Icon>
                        </IconButton>
                    </CreateDirectoryButton>
                </ProgressButton>
            </FileOperationsGroup>
            <FileOperationsGroup>
                <IconButton
                    title={`Download ${selectedItem.basename}`}
                    aria-label={`Download ${selectedItem.basename}`}
                    disabled={isDisabledForMoreThanOneSelection || selectedItem.type !== 'file' || busy}
                    component="a"
                    href={fileActions.getDownloadLink(selectedItem.filename)}
                    download
                >
                    <Download />
                </IconButton>
                <ProgressButton active={activeOperation === Operations.RENAME}>
                    <RenameButton
                        currentName={selectedItem.basename}
                        onRename={newName => handlePathRename(selectedItem, newName)}
                        disabled={isWritingDisabled || isDisabledForMoreThanOneSelection || busy}
                    >
                        <IconButton
                            title={`Rename ${selectedItem.basename}`}
                            aria-label={`Rename ${selectedItem.basename}`}
                            disabled={isWritingDisabled || isDisabledForMoreThanOneSelection || busy}
                        >
                            <Icon>border_color</Icon>
                        </IconButton>
                    </RenameButton>
                </ProgressButton>
                <ProgressButton active={activeOperation === Operations.DELETE}>
                    <ConfirmationButton
                        message={`Are you sure you want to remove ${selectedPaths.length} item(s)?`}
                        onClick={handleDelete}
                        disabled={noPathSelected || isWritingDisabled || busy}
                    >
                        <IconButton
                            title="Delete"
                            aria-label="Delete"
                            disabled={noPathSelected || isWritingDisabled || busy}
                        >
                            <Icon>delete</Icon>
                        </IconButton>

                    </ConfirmationButton>
                </ProgressButton>
            </FileOperationsGroup>
            <FileOperationsGroup>
                <IconButton
                    aria-label="Copy"
                    title="Copy"
                    onClick={e => handleCopy(e)}
                    disabled={noPathSelected || busy}
                >
                    <ContentCopy />
                </IconButton>
                <IconButton
                    aria-label="Cut"
                    title="Cut"
                    onClick={e => handleCut(e)}
                    disabled={isWritingDisabled || noPathSelected || busy}
                >
                    <ContentCut />
                </IconButton>
                <ProgressButton active={activeOperation === Operations.PASTE}>
                    <IconButton
                        aria-label="Paste"
                        title="Paste"
                        onClick={e => handlePaste(e)}
                        disabled={isPasteDisabled || busy}
                    >
                        {addBadgeIfNotEmpty(clipboard.length(), <ContentPaste />)}
                    </IconButton>
                </ProgressButton>
            </FileOperationsGroup>
        </>
    );
};

const ContextualFileOperations = props => {
    const clipboard = useClipboard();
    return <FileOperations clipboard={clipboard} {...props} />;
};

export default ContextualFileOperations;
