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
import {joinPaths, generateUniqueFileName} from "../../utils/fileUtils";

const styles = {
    buttonsContainer: {
        "display": 'inline-block',
        "& button": {
            padding: 10
        }
    },
    buttonsShadow: {
        boxShadow: '0px 1px 1px -1px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 1px 1px 0px rgba(0,0,0,0.12)',
        borderRadius: '4px',
    }
};

export class FileOperations extends React.Component {
    refreshFiles() {
        this.props.fetchFilesIfNeeded(this.props.openedPath);
    }

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
        this.props.paste(this.props.openedPath)
            .then(() => this.refreshFiles())
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

            return this.props.uploadFiles(this.props.openedPath, updatedFiles)
                .then(() => this.refreshFiles())
                .catch((err) => {
                    ErrorDialog.showError(err, "An error occurred while uploading files", () => this.handleUpload(files));
                });
        }
        return Promise.resolve([]);
    }

    handleCreateDirectory(name) {
        return this.props.createDirectory(joinPaths(this.props.openedPath, name))
            .then(() => this.refreshFiles())
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
            disabled: allOperationsDisabled, selectedPaths, creatingDirectory,
            clipboardItemsCount, onRename, selectedItems,
            onDelete, classes, onDownload
        } = this.props;

        if (creatingDirectory) {
            return (<LoadingOverlay loading={creatingDirectory} />);
        }

        const noSelectedPath = selectedPaths.length === 0;
        const moreThanOneItemSelected = selectedPaths.length > 1;
        const selectedItem = selectedItems && selectedItems.length === 1 ? selectedItems[0] : {};

        return (
            <Grid container justify="space-between">
                <Grid item>
                    <div className={classNames(classes.buttonsContainer, classes.buttonsShadow)} style={{marginRight: 8}}>
                        <IconButton
                            onClick={() => onDownload(selectedItem.filename)}
                            title={`Download ${selectedItem.basename}`}
                            aria-label={`Download ${selectedItem.basename}`}
                            disabled={allOperationsDisabled || noSelectedPath || moreThanOneItemSelected || selectedItem.type !== 'file'}
                        >
                            <Download />
                        </IconButton>
                        <RenameButton
                            currentName={selectedItem.basename}
                            onRename={newName => onRename(selectedItem, newName)}
                        >
                            <IconButton
                                title={`Rename ${selectedItem.basename}`}
                                aria-label={`Rename ${selectedItem.basename}`}
                                disabled={allOperationsDisabled || noSelectedPath || moreThanOneItemSelected}
                            >
                                <Icon>border_color</Icon>
                            </IconButton>
                        </RenameButton>
                        <DeleteButton
                            file={selectedItem.basename}
                            onClick={() => onDelete(selectedItem)}
                        >
                            <IconButton
                                title={`Delete ${selectedItem.basename}`}
                                aria-label={`Delete ${selectedItem.basename}`}
                                disabled={allOperationsDisabled || noSelectedPath || moreThanOneItemSelected}
                            >
                                <Icon>delete</Icon>
                            </IconButton>

                        </DeleteButton>
                    </div>

                    <div className={classNames(classes.buttonsContainer, classes.buttonsShadow)}>
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
                            disabled={allOperationsDisabled || clipboardItemsCount === 0}
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
                            onDidUpload={() => this.refreshFiles()}
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
    const {match: {params}} = ownProps;
    const openedCollectionLocation = params.collection;
    const openedPath = params.path ? `/${openedCollectionLocation}/${params.path}` : `/${openedCollectionLocation}`;
    const {collectionBrowser: {selectedPaths}} = state;
    const filesOfCurrentPath = (state.cache.filesByPath[openedPath] || {}).data || [];
    const selectedItems = filesOfCurrentPath.filter(f => selectedPaths.includes(f.filename)) || [];

    return {
        selectedPaths,
        selectedItems,
        clipboardItemsCount: state.clipboard.filenames ? state.clipboard.filenames.length : 0,
        creatingDirectory: state.cache.filesByPath.creatingDirectory
    };
};

const mapDispatchToProps = {
    ...fileActions,
    ...clipboardActions
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FileOperations)));
