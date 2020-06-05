import React, {useContext, useState} from 'react';
import {Badge, IconButton} from "@material-ui/core";
import {BorderColor, CreateNewFolder, Delete} from '@material-ui/icons';
import ContentCopy from "mdi-material-ui/ContentCopy";
import ContentCut from "mdi-material-ui/ContentCut";
import ContentPaste from "mdi-material-ui/ContentPaste";
import Download from "mdi-material-ui/Download";
import ErrorDialog from "../common/components/ErrorDialog";

import {getParentPath, joinPaths} from "./fileUtils";
import {COPY, CUT} from '../constants';
import FileOperationsGroup from "./FileOperationsGroup";
import ClipboardContext from '../common/contexts/ClipboardContext';
import ConfirmationButton from "../common/components/ConfirmationButton";
import {isDataSteward} from "../users/userUtils";
import UserContext from "../users/UserContext";
import CreateDirectoryButton from "./buttons/CreateDirectoryButton";
import ProgressButton from "../common/components/ProgressButton";
import RenameButton from "./buttons/RenameButton";

export const Operations = {
    PASTE: 'PASTE',
    MKDIR: 'MKDIR',
    RENAME: 'RENAME',
    DELETE: 'DELETE'
};
Object.freeze(Operations);

export const FileOperations = ({
    isWritingEnabled,
    currentUser,
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
    const selectedDeletedItems = selectedItems.filter(f => f.dateDeleted);
    const isDeletedItemSelected = selectedDeletedItems.length > 0;
    const isDisabledForMoreThanOneSelection = selectedPaths.length === 0 || moreThanOneItemSelected;
    const isClipboardItemsOnOpenedPath = !clipboard.isEmpty() && clipboard.filenames.map(f => getParentPath(f)).includes(openedPath);
    const isPasteDisabled = !isWritingEnabled || clipboard.isEmpty() || (isClipboardItemsOnOpenedPath && clipboard.method === CUT);

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
        }
        if (clipboard.method === COPY) {
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

    const handleDelete = () => fileOperation(Operations.DELETE, fileActions.deleteMultiple(selectedPaths))
        .catch((err) => {
            ErrorDialog.showError(err, err.message || "An error occurred while deleting file or directory", () => handleDelete());
        });


    const getDeletionConfirmationMessage = () => {
        if (isDeletedItemSelected) {
            if (selectedDeletedItems.length === 1) {
                return 'Selected item is already marked as deleted. '
                    + 'By clicking "Remove" you agree to remove the item permanently!';
            }
            return `${selectedDeletedItems.length} of ${selectedPaths.length} selected items are already marked as deleted. 
            By clicking "Remove" you agree to remove these items permanently!`;
        }
        return `Are you sure you want to remove ${selectedPaths.length} item(s)? `;
    };

    return (
        <>
            <FileOperationsGroup>
                {isWritingEnabled && (
                    <ProgressButton active={activeOperation === Operations.MKDIR}>
                        <CreateDirectoryButton
                            onCreate={name => handleCreateDirectory(name)}
                            disabled={busy}
                        >
                            <IconButton
                                aria-label="Create directory"
                                title="Create directory"
                                disabled={busy}
                            >
                                <CreateNewFolder />
                            </IconButton>
                        </CreateDirectoryButton>
                    </ProgressButton>
                )}
            </FileOperationsGroup>
            <FileOperationsGroup>
                <IconButton
                    title={`Download ${selectedItem.basename}`}
                    aria-label={`Download ${selectedItem.basename}`}
                    disabled={isDisabledForMoreThanOneSelection || selectedItem.type !== 'file' || isDeletedItemSelected || busy}
                    component="a"
                    href={fileActions.getDownloadLink(selectedItem.filename)}
                    download
                >
                    <Download />
                </IconButton>
                {isDataSteward(currentUser) && (
                    <>
                        <ProgressButton active={activeOperation === Operations.RENAME}>
                            <RenameButton
                                currentName={selectedItem.basename}
                                onRename={newName => handlePathRename(selectedItem, newName)}
                                disabled={isDisabledForMoreThanOneSelection || isDeletedItemSelected || busy}
                            >
                                <IconButton
                                    title={`Rename ${selectedItem.basename}`}
                                    aria-label={`Rename ${selectedItem.basename}`}
                                    disabled={isDisabledForMoreThanOneSelection || isDeletedItemSelected || busy}
                                >
                                    <BorderColor />
                                </IconButton>
                            </RenameButton>
                        </ProgressButton>
                        <ProgressButton active={activeOperation === Operations.DELETE}>
                            <ConfirmationButton
                                message={getDeletionConfirmationMessage()}
                                agreeButtonText="Remove"
                                dangerous
                                onClick={handleDelete}
                                disabled={noPathSelected || busy}
                            >
                                <IconButton
                                    title="Delete"
                                    aria-label="Delete"
                                    disabled={noPathSelected || busy}
                                >
                                    <Delete />
                                </IconButton>
                            </ConfirmationButton>
                        </ProgressButton>
                    </>
                )}
            </FileOperationsGroup>
            <FileOperationsGroup>
                <IconButton
                    aria-label="Copy"
                    title="Copy"
                    onClick={e => handleCopy(e)}
                    disabled={noPathSelected || isDeletedItemSelected || busy}
                >
                    <ContentCopy />
                </IconButton>
                {isDataSteward(currentUser) && (
                    <IconButton
                        aria-label="Cut"
                        title="Cut"
                        onClick={e => handleCut(e)}
                        disabled={noPathSelected || isDeletedItemSelected || busy}
                    >
                        <ContentCut />
                    </IconButton>
                )}
                <ProgressButton active={activeOperation === Operations.PASTE}>
                    <IconButton
                        aria-label="Paste"
                        title="Paste"
                        onClick={e => handlePaste(e)}
                        disabled={isPasteDisabled || isDeletedItemSelected || busy}
                    >
                        {addBadgeIfNotEmpty(clipboard.length(), <ContentPaste />)}
                    </IconButton>
                </ProgressButton>
            </FileOperationsGroup>
        </>
    );
};

const ContextualFileOperations = props => {
    const clipboard = useContext(ClipboardContext);
    const {currentUser} = useContext(UserContext);

    return <FileOperations clipboard={clipboard} currentUser={currentUser} {...props} />;
};

export default ContextualFileOperations;
