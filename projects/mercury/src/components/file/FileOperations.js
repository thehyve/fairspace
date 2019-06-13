import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";
import {Badge, Icon, IconButton, Grid} from "@material-ui/core";
import {ContentCopy, ContentCut, ContentPaste, Download} from "mdi-material-ui";
import {withStyles} from '@material-ui/core/styles';
import classNames from 'classnames';

import {
    CreateDirectoryButton, ErrorDialog, LoadingOverlay,
    UploadButton, RenameButton, DeleteButton
} from "../common";
import * as clipboardActions from "../../actions/clipboardActions";
import * as fileActions from "../../actions/fileActions";
import {joinPaths, generateUniqueFileName, getParentPath} from "../../utils/fileUtils";
import styles from './FileOperations.styles';
import {CUT} from '../../constants';

export class FileOperations extends React.Component {
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
        this.props.onFileOperation(this.props.paste(this.props.openedPath))
            .catch((err) => {
                ErrorDialog.showError(err, "An error occurred while pasting your contents");
            });
    }

    handleUpload(files) {
        if (files && files.length > 0) {
            const updatedFiles = files.map(file => ({
                value: file,
                name: generateUniqueFileName(file.name, this.props.existingFiles)
            }));

            return this.props.onFileOperation(this.props.uploadFiles(this.props.openedPath, updatedFiles))
                .catch((err) => {
                    ErrorDialog.showError(err, "An error occurred while uploading files", () => this.handleUpload(files));
                });
        }
        return Promise.resolve([]);
    }

    handleCreateDirectory(name) {
        return this.props.onFileOperation(this.props.createDirectory(joinPaths(this.props.openedPath, name)))
            .catch((err) => {
                if (err.response.status === 405) {
                    const message = "A directory or file with this name already exists. Please choose another name";
                    ErrorDialog.showError(err, message, false);
                    return false;
                }
                ErrorDialog.showError(err, "An error occurred while creating directory", () => this.handleCreateDirectory(name));
                return true;
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

    render() {
        const {
            allOperationsDisabled, creatingDirectory, clipboardItemsCount, onRename, onDelete,
            classes, getDownloadLink, selectedItem = {}, disabledForMoreThanOneSelection, isPasteDisabled, noSelectedPath
        } = this.props;

        if (creatingDirectory) {
            return (<LoadingOverlay loading={creatingDirectory} />);
        }

        return (
            <Grid container justify="space-between">
                <Grid item>
                    <div className={classNames(classes.buttonsContainer, classes.buttonsGroupShadow)} style={{marginRight: 8}}>
                        <IconButton
                            title={`Download ${selectedItem.basename}`}
                            aria-label={`Download ${selectedItem.basename}`}
                            disabled={disabledForMoreThanOneSelection || selectedItem.type !== 'file'}
                            component="a"
                            href={getDownloadLink(selectedItem.filename)}
                            download
                        >
                            <Download />
                        </IconButton>
                        <RenameButton
                            currentName={selectedItem.basename}
                            onRename={newName => onRename(selectedItem, newName)}
                            disabled={disabledForMoreThanOneSelection}
                        >
                            <IconButton
                                title={`Rename ${selectedItem.basename}`}
                                aria-label={`Rename ${selectedItem.basename}`}
                                disabled={disabledForMoreThanOneSelection}
                            >
                                <Icon>border_color</Icon>
                            </IconButton>
                        </RenameButton>
                        <DeleteButton
                            file={selectedItem.basename}
                            onClick={() => onDelete(selectedItem)}
                            disabled={disabledForMoreThanOneSelection}
                        >
                            <IconButton
                                title={`Delete ${selectedItem.basename}`}
                                aria-label={`Delete ${selectedItem.basename}`}
                                disabled={disabledForMoreThanOneSelection}
                            >
                                <Icon>delete</Icon>
                            </IconButton>

                        </DeleteButton>
                    </div>

                    <div className={classNames(classes.buttonsContainer, classes.buttonsGroupShadow)}>
                        <IconButton
                            aria-label="Copy"
                            title="Copy"
                            onClick={e => this.handleCopy(e)}
                            disabled={allOperationsDisabled || noSelectedPath}
                        >
                            <ContentCopy />
                        </IconButton>
                        <IconButton
                            aria-label="Cut"
                            title="Cut"
                            onClick={e => this.handleCut(e)}
                            disabled={allOperationsDisabled || noSelectedPath}
                        >
                            <ContentCut />
                        </IconButton>
                        <IconButton
                            aria-label="Paste"
                            title="Paste"
                            onClick={e => this.handlePaste(e)}
                            disabled={isPasteDisabled}
                        >
                            {this.addBadgeIfNotEmpty(
                                clipboardItemsCount,
                                <ContentPaste />
                            )}
                        </IconButton>
                    </div>
                </Grid>

                <Grid item>
                    <div className={classes.buttonsContainer}>
                        <CreateDirectoryButton
                            onCreate={name => this.handleCreateDirectory(name)}
                        >
                            <IconButton
                                aria-label="Create directory"
                                title="Create directory"
                                disabled={allOperationsDisabled}
                            >
                                <Icon>create_new_folder</Icon>
                            </IconButton>
                        </CreateDirectoryButton>
                        <UploadButton
                            onUpload={files => this.handleUpload(files)}
                        >
                            <IconButton
                                title="Upload"
                                aria-label="Upload"
                                disabled={allOperationsDisabled}
                            >
                                <Icon>cloud_upload</Icon>
                            </IconButton>
                        </UploadButton>
                    </div>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const {match: {params}, disabled: allOperationsDisabled} = ownProps;
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
    const isPasteDisabled = allOperationsDisabled || clipboardItemsCount === 0 || (isClipboardItemsOnOpenedPath && clipboard.type === CUT);
    const disabledForMoreThanOneSelection = allOperationsDisabled || noSelectedPath || moreThanOneItemSelected;

    return {
        creatingDirectory: filesByPath.creatingDirectory,
        selectedPaths,
        selectedItem,
        clipboardItemsCount,
        disabledForMoreThanOneSelection,
        noSelectedPath,
        isPasteDisabled
    };
};

const mapDispatchToProps = {
    ...fileActions,
    ...clipboardActions
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FileOperations)));
