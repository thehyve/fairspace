import React, {useState} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";
import {Badge, Icon, IconButton} from "@material-ui/core";
import ContentCopy from "mdi-material-ui/ContentCopy";
import ContentCut from "mdi-material-ui/ContentCut";
import ContentPaste from "mdi-material-ui/ContentPaste";
import Download from "mdi-material-ui/Download";

import {DeleteButton, ErrorDialog, ProgressButton} from '../common/components';
import {CreateDirectoryButton, RenameButton} from "./buttons";
import * as clipboardActions from "../common/redux/actions/clipboardActions";
import * as fileActions from "../common/redux/actions/fileActions";
import {getParentPath, joinPaths} from "../common/utils/fileUtils";
import {CUT} from '../constants';
import FileOperationsGroup from "./FileOperationsGroup";

export const Operations = {
    PASTE: 'PASTE',
    RENAME: 'RENAME',
    MKDIR: 'MKDIR',
    DELETE: 'DELETE'
};
Object.freeze(Operations);

export const FileOperations = ({
    isWritingDisabled,
    isPasteDisabled,
    isDisabledForMoreThanOneSelection,
    clipboardItemsCount,
    openedPath,
    selectedPaths = [],
    selectedItem = {},
    getDownloadLink = () => {},

    cut,
    copy,
    paste,
    fetchFilesIfNeeded,
    createDirectory,
    deleteMultiple,
    renameFile
}) => {
    const [activeOperation, setActiveOperation] = useState();
    const busy = !!activeOperation;
    const noPathSelected = selectedPaths.length === 0;

    const fileOperation = (operationCode, operationPromise) => {
        setActiveOperation(operationCode);
        return operationPromise
            .then(r => {
                setActiveOperation();
                fetchFilesIfNeeded(openedPath);
                return r;
            })
            .catch(e => {
                setActiveOperation();
                return Promise.reject(e);
            });
    };

    const handleCut = e => {
        if (e) e.stopPropagation();
        cut(selectedPaths);
    };

    const handleCopy = e => {
        if (e) e.stopPropagation();
        copy(selectedPaths);
    };

    const handlePaste = e => {
        if (e) e.stopPropagation();
        return fileOperation(Operations.PASTE, paste(openedPath))
            .catch((err) => {
                ErrorDialog.showError(err, err.message || "An error occurred while pasting your contents");
            });
    };

    const handleCreateDirectory = name => fileOperation(Operations.MKDIR, createDirectory(joinPaths(openedPath, name)))
        .catch((err) => {
            ErrorDialog.showError(err, err.message || "An error occurred while creating directory", () => handleCreateDirectory(name));
            return true;
        });

    const handleDelete = () => fileOperation(Operations.DELETE, deleteMultiple(selectedPaths))
        .catch((err) => {
            ErrorDialog.showError(err, err.message || "An error occurred while deleting file or directory", () => handleDelete());
        });

    const handlePathRename = (path, newName) => fileOperation(Operations.RENAME, renameFile(openedPath, path.basename, newName))
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
                    href={getDownloadLink(selectedItem.filename)}
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
                    <DeleteButton
                        numItems={selectedPaths ? selectedPaths.length : 0}
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

                    </DeleteButton>
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
                        {addBadgeIfNotEmpty(clipboardItemsCount, <ContentPaste />)}
                    </IconButton>
                </ProgressButton>
            </FileOperationsGroup>
        </>
    );
};

const mapStateToProps = (state, ownProps) => {
    const {match: {params}, disabled: isWritingDisabled} = ownProps;
    const {collectionBrowser: {selectedPaths}, cache: {filesByPath}, clipboard} = state;
    const openedCollectionLocation = params.collection;
    const openedPath = params.path ? `/${openedCollectionLocation}/${params.path}` : `/${openedCollectionLocation}`;
    const filesOfCurrentPath = (filesByPath[openedPath] || {}).data || [];
    const selectedItems = filesOfCurrentPath.filter(f => selectedPaths.includes(f.filename)) || [];
    const selectedItem = selectedItems && selectedItems.length === 1 ? selectedItems[0] : {};
    const moreThanOneItemSelected = selectedPaths.length > 1;
    const filenamesInClipboard = clipboard.filenames;
    const clipboardItemsCount = clipboard.filenames ? clipboard.filenames.length : 0;
    const isClipboardItemsOnOpenedPath = filenamesInClipboard && filenamesInClipboard.map(f => getParentPath(f)).includes(openedPath);
    const isPasteDisabled = isWritingDisabled || clipboardItemsCount === 0 || (isClipboardItemsOnOpenedPath && clipboard.type === CUT);
    const isDisabledForMoreThanOneSelection = selectedPaths.length === 0 || moreThanOneItemSelected;

    return {
        selectedPaths,
        selectedItem,
        clipboardItemsCount,
        isDisabledForMoreThanOneSelection,
        isPasteDisabled,
        isWritingDisabled
    };
};

const mapDispatchToProps = {
    ...fileActions,
    ...clipboardActions
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FileOperations));
