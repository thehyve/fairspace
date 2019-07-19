import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";
import {Badge, Icon, IconButton, Grid} from "@material-ui/core";
import {ContentCopy, ContentCut, ContentPaste, Download} from "mdi-material-ui";
import {withStyles} from '@material-ui/core/styles';
import classNames from 'classnames';

import {
    CreateDirectoryButton, ErrorDialog,
    UploadButton, RenameButton, DeleteButton,
    ProgressButton
} from "../common";
import * as clipboardActions from "../../actions/clipboardActions";
import * as fileActions from "../../actions/fileActions";
import {joinPaths, generateUniqueFileName, getParentPath} from "../../utils/fileUtils";
import styles from './FileOperations.styles';
import {CUT} from '../../constants';

export const Operations = {
    PASTE: 'PASTE',
    RENAME: 'RENAME',
    MKDIR: 'MKDIR',
    DELETE: 'DELETE',
    UPLOAD: 'UPLOAD'
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

    handleUpload(files) {
        if (files && files.length > 0) {
            const usedNames = [...this.props.existingFiles];
            const updatedFiles = files.map(file => {
                const name = generateUniqueFileName(file.name, usedNames);
                usedNames.push(name);
                return {value: file, name};
            });

            return this.fileOperation(Operations.UPLOAD, this.props.uploadFiles(this.props.openedPath, updatedFiles))
                .catch((err) => {
                    ErrorDialog.showError(err, err.message || "An error occurred while uploading files", () => this.handleUpload(files));
                });
        }
        return Promise.resolve([]);
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
    }

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
            classes, getDownloadLink, selectedItem = {}, disabledForMoreThanOneSelection, isPasteDisabled, noSelectedPath
        } = this.props;

        const op = this.state.activeOperation;
        const busy = !!op;

        return (
            <Grid container justify="space-between">
                <Grid item>
                    <div
                        className={classNames(classes.buttonsContainer, classes.buttonsGroupShadow)}
                        style={{marginRight: 8}}
                    >
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
                    </div>
                    <div className={classNames(classes.buttonsContainer, classes.buttonsGroupShadow)}>
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
                    </div>
                </Grid>

                <Grid item>
                    <div className={classes.buttonsContainer}>
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
                        <ProgressButton active={op === Operations.UPLOAD}>
                            <UploadButton
                                onUpload={files => this.handleUpload(files)}
                                disabled={isWritingDisabled || busy}
                            >
                                <IconButton
                                    title="Upload"
                                    aria-label="Upload"
                                    disabled={isWritingDisabled || busy}
                                >
                                    <Icon>cloud_upload</Icon>
                                </IconButton>
                            </UploadButton>
                        </ProgressButton>
                    </div>
                </Grid>
            </Grid>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FileOperations)));
