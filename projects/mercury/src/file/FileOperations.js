import React, {useContext, useState} from 'react';
import {Badge, IconButton, ListItem, ListItemText, withStyles} from "@material-ui/core";
import {BorderColor, CloudUpload, CreateNewFolder, Delete, Restore, RestoreFromTrash} from '@material-ui/icons';
import ContentCopy from "mdi-material-ui/ContentCopy";
import ContentCut from "mdi-material-ui/ContentCut";
import ContentPaste from "mdi-material-ui/ContentPaste";
import Download from "mdi-material-ui/Download";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Divider from "@material-ui/core/Divider";
import ErrorDialog from "../common/components/ErrorDialog";

import {getParentPath, isListOnlyFile, joinPaths} from "./fileUtils";
import {COPY, CUT} from '../constants';
import FileOperationsGroup from "./FileOperationsGroup";
import ClipboardContext from '../common/contexts/ClipboardContext';
import ConfirmationButton from "../common/components/ConfirmationButton";
import CreateDirectoryButton from "./buttons/CreateDirectoryButton";
import ProgressButton from "../common/components/ProgressButton";
import RenameButton from "./buttons/RenameButton";
import ShowFileVersionsButton from "./buttons/ShowFileVersionsButton";
import styles from "./FileOperations.styles";

export const Operations = {
    PASTE: 'PASTE',
    MKDIR: 'MKDIR',
    RENAME: 'RENAME',
    DELETE: 'DELETE',
    UNDELETE: 'UNDELETE',
    REVERT: 'REVERT'
};
Object.freeze(Operations);

export const FileOperations = ({
    isWritingEnabled,
    showDeleted,
    isExternalStorage = false,
    openedPath,
    selectedPaths,
    clearSelection,
    fileActions = {},
    classes,
    files,
    refreshFiles,
    uploadFolder,
    uploadFile,
    maxFileSize,
    clipboard
}) => {
    const [activeOperation, setActiveOperation] = useState();
    const [anchorEl, setAnchorEl] = useState(null);

    const busy = !!activeOperation;

    const noPathSelected = selectedPaths.length === 0;
    const selectedItems = files.filter(f => selectedPaths.includes(f.filename)) || [];
    const selectedItem = selectedItems && selectedItems.length === 1 ? selectedItems[0] : {};
    const moreThanOneItemSelected = selectedPaths.length > 1;
    const selectedDeletedItems = selectedItems.filter(f => f.dateDeleted);
    const isDeletedItemSelected = selectedDeletedItems.length > 0;
    const isListOnlyItemSelected = isListOnlyFile(selectedItem);
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
                .catch(err => ErrorDialog.showError("An error occurred while pasting your contents", err));
        }

        return Promise.resolve();
    };

    const handleCreateDirectory = name => fileOperation(Operations.MKDIR, fileActions.createDirectory(joinPaths(openedPath, name)))
        .catch((err) => {
            if (err.message.includes('status code 409')) {
                ErrorDialog.showError(
                    'Directory name must be unique',
                    'Directory with this name already exists and was marked as deleted.\n'
                    + 'Please delete the existing directory permanently or choose a unique name.'
                );
                return true;
            }
            ErrorDialog.showError("An error occurred while creating directory", err, () => handleCreateDirectory(name));
            return true;
        });

    const handlePathRename = (path, newName) => fileOperation(Operations.RENAME, fileActions.renameFile(path.basename, newName))
        .catch((err) => {
            ErrorDialog.showError("An error occurred while renaming file or directory", err, () => handlePathRename(path, newName));
            return false;
        });

    const handleRevert = (versionToRevert) => fileOperation(Operations.REVERT, fileActions.revertToVersion(selectedItem, versionToRevert))
        .catch((err) => {
            ErrorDialog.showError("An error occurred while reverting a file to a previous version", err, () => handleRevert(versionToRevert));
            return false;
        });

    const handleUploadMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUploadMenuClose = () => {
        setAnchorEl(null);
    };

    const handleUploadFile = () => {
        handleUploadMenuClose();
        uploadFile();
    };

    const handleUploadFolder = () => {
        handleUploadMenuClose();
        uploadFolder();
    };

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
            ErrorDialog.showError("An error occurred while deleting file or directory", err, () => handleDelete());
        });

    const getDeletionConfirmationMessage = () => {
        if (isDeletedItemSelected) {
            if (selectedDeletedItems.length === 1 && selectedItems.length === 1) {
                return 'Selected item is already marked as deleted. '
                    + 'By clicking "Remove" you agree to remove the item permanently!';
            }
            return `${selectedDeletedItems.length} of ${selectedPaths.length} selected items are already marked as deleted. 
            By clicking "Remove" you agree to remove these items permanently!`;
        }
        return `Are you sure you want to remove ${selectedPaths.length} item(s)? `;
    };

    const handleUndelete = () => fileOperation(Operations.UNDELETE, fileActions.undeleteMultiple(selectedPaths))
        .catch((err) => {
            ErrorDialog.showError("An error occurred while undeleting file or directory", err, () => handleUndelete());
        });

    return (
        <>
            <FileOperationsGroup>
                {isWritingEnabled && (
                    <>
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

                        <IconButton
                            aria-label="Upload"
                            title="Upload &hellip;"
                            disabled={busy}
                            onClick={handleUploadMenuClick}
                        >
                            <CloudUpload />
                        </IconButton>
                        <Menu
                            id="upload-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleUploadMenuClose}
                            className={classes.uploadMenu}
                        >
                            <MenuItem onClick={handleUploadFile}>Upload files</MenuItem>
                            <MenuItem onClick={handleUploadFolder}>Upload folder</MenuItem>
                            <Divider className={classes.uploadMenuHelperDivider} />
                            <ListItem className={classes.uploadMenuHelper}>
                                <ListItemText
                                    secondary={`Size limit: ${maxFileSize}`}
                                    className={classes.uploadMenuHelperText}
                                />
                            </ListItem>
                        </Menu>

                    </>
                )}
            </FileOperationsGroup>
            <FileOperationsGroup>
                <IconButton
                    title={`Download ${selectedItem.basename}`}
                    aria-label={`Download ${selectedItem.basename}`}
                    disabled={
                        isDisabledForMoreThanOneSelection || selectedItem.type !== 'file'
                        || isDeletedItemSelected || busy || isListOnlyItemSelected
                    }
                    component="a"
                    href={fileActions.getDownloadLink(selectedItem.filename)}
                    download
                >
                    <Download />
                </IconButton>
                {isWritingEnabled && (
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
                        {showDeleted && (
                            <ProgressButton active={activeOperation === Operations.UNDELETE}>
                                <ConfirmationButton
                                    message={`Are you sure you want to undelete ${selectedPaths.length} item(s)?`}
                                    agreeButtonText="Undelete"
                                    dangerous
                                    onClick={handleUndelete}
                                    disabled={noPathSelected || (selectedDeletedItems.length !== selectedItems.length) || busy}
                                >
                                    <IconButton
                                        title="Undelete"
                                        aria-label="Undelete"
                                        disabled={noPathSelected || (selectedDeletedItems.length !== selectedItems.length) || busy}
                                    >
                                        <RestoreFromTrash />
                                    </IconButton>
                                </ConfirmationButton>
                            </ProgressButton>
                        )}

                    </>
                )}
            </FileOperationsGroup>
            <FileOperationsGroup>
                {!isExternalStorage && (
                    <IconButton
                        aria-label="Copy"
                        title="Copy"
                        onClick={e => handleCopy(e)}
                        disabled={noPathSelected || isDeletedItemSelected || busy}
                    >
                        <ContentCopy />
                    </IconButton>
                )}
                {isWritingEnabled && (
                    <>
                        <IconButton
                            aria-label="Cut"
                            title="Cut"
                            onClick={e => handleCut(e)}
                            disabled={noPathSelected || isDeletedItemSelected || busy}
                        >
                            <ContentCut />
                        </IconButton>
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
                    </>
                )}
            </FileOperationsGroup>
            <FileOperationsGroup>
                {!isExternalStorage && (
                    <ProgressButton active={activeOperation === Operations.REVERT}>
                        <ShowFileVersionsButton
                            selectedFile={selectedItem}
                            onRevert={handleRevert}
                            disabled={isDisabledForMoreThanOneSelection || selectedItem.type !== 'file' || isDeletedItemSelected || busy}
                            isWritingEnabled={isWritingEnabled}
                        >
                            <IconButton
                                aria-label="Show history"
                                title="Show history"
                                disabled={isDisabledForMoreThanOneSelection || selectedItem.type !== 'file' || isDeletedItemSelected || busy}
                            >
                                <Restore />
                            </IconButton>
                        </ShowFileVersionsButton>
                    </ProgressButton>
                )}
            </FileOperationsGroup>
        </>
    );
};

const ContextualFileOperations = props => {
    const clipboard = useContext(ClipboardContext);

    return <FileOperations clipboard={clipboard} {...props} />;
};

export default withStyles(styles)(ContextualFileOperations);
