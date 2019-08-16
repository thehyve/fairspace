import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";
import {Badge, Icon, IconButton} from "@material-ui/core";
import {ContentCopy, ContentCut, ContentPaste, Download} from "mdi-material-ui";

import {CreateDirectoryButton, DeleteButton, ErrorDialog, ProgressButton, RenameButton} from "../common";
import * as clipboardActions from "../../actions/clipboardActions";
import * as fileActions from "../../actions/fileActions";
import {getParentPath, joinPaths} from "../../utils/fileUtils";
import {CUT} from '../../constants';
import FileOperationsGroup from "./FileOperationsGroup";

export const Operations = {
    PASTE: 'PASTE',
    RENAME: 'RENAME',
    MKDIR: 'MKDIR',
    DELETE: 'DELETE'
};
Object.freeze(Operations);

export class FileOperations extends React.Component {
    state = {activeOperation: null};

    handleCut(e) {
        e.stopPropagation();
        this.props.cut(this.props.selectedPaths);
    }

    handleCopy(e) {
        e.stopPropagation();
        this.props.copy(this.props.selectedPaths);
    }

    handlePaste(e) {
        e.stopPropagation();
        return this.fileOperation(Operations.PASTE, this.props.paste(this.props.openedPath))
            .catch((err) => {
                ErrorDialog.showError(err, err.message || "An error occurred while pasting your contents");
            });
    }

    handleCreateDirectory(name) {
        return this.fileOperation(Operations.MKDIR, this.props.createDirectory(joinPaths(this.props.openedPath, name)))
            .catch((err) => {
                ErrorDialog.showError(err, err.message || "An error occurred while creating directory", () => this.handleCreateDirectory(name));
                return true;
            });
    }

    handleDelete = () => this.fileOperation(Operations.DELETE, this.props.deleteMultiple(this.props.selectedPaths))
        .catch((err) => {
            ErrorDialog.showError(err, err.message || "An error occurred while deleting file or directory", () => this.handleDelete());
        });

    handlePathRename = (path, newName) => {
        const {renameFile, openedPath} = this.props;

        return this.fileOperation(Operations.RENAME, renameFile(openedPath, path.basename, newName))
            .catch((err) => {
                ErrorDialog.showError(err, err.message || "An error occurred while renaming file or directory", () => this.handlePathRename(path, newName));
                return false;
            });
    };

    addBadgeIfNotEmpty(badgeContent, children) {
        if (badgeContent) {
            return (
                <Badge badgeContent={badgeContent} color="primary">
                    {children}
                </Badge>
            );
        }
        return children;
    }

    fileOperation(operationCode, operationPromise) {
        this.setState({activeOperation: operationCode});
        return operationPromise
            .then(r => {
                this.setState({activeOperation: null});
                this.props.fetchFilesIfNeeded(this.props.openedPath);
                return r;
            })
            .catch(e => {
                this.setState({activeOperation: null});
                return Promise.reject(e);
            });
    }

    render() {
        const {
            isWritingDisabled, clipboardItemsCount, selectedPaths,
            getDownloadLink, selectedItem = {}, disabledForMoreThanOneSelection, isPasteDisabled, noSelectedPath
        } = this.props;

        const op = this.state.activeOperation;
        const busy = !!op;

        return (
            <>
                <FileOperationsGroup>
                    <ProgressButton active={op === Operations.MKDIR}>
                        <CreateDirectoryButton
                            onCreate={name => this.handleCreateDirectory(name)}
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
                        disabled={disabledForMoreThanOneSelection || selectedItem.type !== 'file' || busy}
                        component="a"
                        href={getDownloadLink(selectedItem.filename)}
                        download
                    >
                        <Download />
                    </IconButton>
                    <ProgressButton active={op === Operations.RENAME}>
                        <RenameButton
                            currentName={selectedItem.basename}
                            onRename={newName => this.handlePathRename(selectedItem, newName)}
                            disabled={isWritingDisabled || disabledForMoreThanOneSelection || busy}
                        >
                            <IconButton
                                title={`Rename ${selectedItem.basename}`}
                                aria-label={`Rename ${selectedItem.basename}`}
                                disabled={isWritingDisabled || disabledForMoreThanOneSelection || busy}
                            >
                                <Icon>border_color</Icon>
                            </IconButton>
                        </RenameButton>
                    </ProgressButton>
                    <ProgressButton active={op === Operations.DELETE}>
                        <DeleteButton
                            numItems={selectedPaths ? selectedPaths.length : 0}
                            onClick={this.handleDelete}
                            disabled={noSelectedPath || isWritingDisabled || busy}
                        >
                            <IconButton
                                title="Delete"
                                aria-label="Delete"
                                disabled={noSelectedPath || isWritingDisabled || busy}
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
                        onClick={e => this.handleCopy(e)}
                        disabled={noSelectedPath || busy}
                    >
                        <ContentCopy />
                    </IconButton>
                    <IconButton
                        aria-label="Cut"
                        title="Cut"
                        onClick={e => this.handleCut(e)}
                        disabled={isWritingDisabled || noSelectedPath || busy}
                    >
                        <ContentCut />
                    </IconButton>
                    <ProgressButton active={op === Operations.PASTE}>
                        <IconButton
                            aria-label="Paste"
                            title="Paste"
                            onClick={e => this.handlePaste(e)}
                            disabled={isPasteDisabled || busy}
                        >
                            {this.addBadgeIfNotEmpty(clipboardItemsCount, <ContentPaste />)}
                        </IconButton>
                    </ProgressButton>
                </FileOperationsGroup>
            </>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const {match: {params}, disabled: isWritingDisabled} = ownProps;
    const {collectionBrowser: {selectedPaths}, cache: {filesByPath}, clipboard} = state;
    const openedCollectionLocation = params.collection;
    const openedPath = params.path ? `/${openedCollectionLocation}/${params.path}` : `/${openedCollectionLocation}`;
    const filesOfCurrentPath = (filesByPath[openedPath] || {}).data || [];
    const selectedItems = filesOfCurrentPath.filter(f => selectedPaths.includes(f.filename)) || [];
    const selectedItem = selectedItems && selectedItems.length === 1 ? selectedItems[0] : {};
    const noSelectedPath = selectedPaths.length === 0;
    const moreThanOneItemSelected = selectedPaths.length > 1;
    const filenamesInClipboard = clipboard.filenames;
    const clipboardItemsCount = clipboard.filenames ? clipboard.filenames.length : 0;
    const isClipboardItemsOnOpenedPath = filenamesInClipboard && filenamesInClipboard.map(f => getParentPath(f)).includes(openedPath);
    const isPasteDisabled = isWritingDisabled || clipboardItemsCount === 0 || (isClipboardItemsOnOpenedPath && clipboard.type === CUT);
    const disabledForMoreThanOneSelection = noSelectedPath || moreThanOneItemSelected;

    return {
        selectedPaths,
        selectedItem,
        clipboardItemsCount,
        disabledForMoreThanOneSelection,
        noSelectedPath,
        isPasteDisabled,
        isWritingDisabled
    };
};

const mapDispatchToProps = {
    ...fileActions,
    ...clipboardActions
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FileOperations));
