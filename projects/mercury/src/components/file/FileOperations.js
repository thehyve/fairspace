import React from 'react';
import {connect} from 'react-redux';
import {Badge, Icon, IconButton} from "@material-ui/core";
import {ContentCopy, ContentCut, ContentPaste} from "mdi-material-ui";

import {CreateDirectoryButton, ErrorDialog, LoadingOverlay, UploadButton} from "../common";
import * as clipboardActions from "../../actions/clipboardActions";
import * as fileActions from "../../actions/fileActions";
import {joinPaths, uniqueName} from "../../utils/fileUtils";

class FileOperations extends React.Component {
    // const {
    //     clipboardItemsCount, disabled, creatingDirectory,
    //     openedPath, selectedPaths,
    //     fetchFilesIfNeeded, uploadFiles, createDirectory,
    //     cut, copy, paste, existingFiles
    // } = props;

    refreshFiles() {
        this.fetchFilesIfNeeded(this.props.openedPath);
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
            .then(this.props.refreshFiles)
            .catch((err) => {
                ErrorDialog.showError(err, "An error occurred while pasting your contents");
            });
    }

    handleUpload(files) {
        if (files && files.length > 0) {
            const nameMapping = new Map();
            files.forEach(file => nameMapping.set(file.name, uniqueName(file.name, this.props.existingFiles)));
            return this.props.uploadFiles(this.props.openedPath, files, nameMapping)
                .then(this.props.refreshFiles)
                .catch((err) => {
                    ErrorDialog.showError(err, "An error occurred while uploading files", () => this.handleUpload(files));
                });
        }
        return Promise.resolve([]);
    }

    handleCreateDirectory(name) {
        return this.props.createDirectory(joinPaths(this.props.openedPath, name))
            .then(this.props.refreshFiles)
            .catch((err) => {
                if (err.status === 405) {
                    // Directory already exists
                    ErrorDialog.showError(err, "A directory or file with this name already exists. Please choose another name");
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
        const buttonColor = this.props.disabled ? 'default' : 'secondary';
        const noSelectedPath = this.props.selectedPaths.length === 0;

        return this.props.creatingDirectory
            ? <LoadingOverlay loading={this.props.creatingDirectory} />
            : (
                <>
                    <IconButton
                        aria-label="Copy"
                        title="Copy"
                        onClick={this.handleCopy()}
                        disabled={noSelectedPath || this.props.disabled}
                        color={buttonColor}
                    >
                        <ContentCopy />
                    </IconButton>
                    <IconButton
                        aria-label="Cut"
                        title="Cut"
                        onClick={this.handleCut()}
                        disabled={noSelectedPath || this.props.disabled}
                        color={buttonColor}
                    >
                        <ContentCut />
                    </IconButton>
                    <IconButton
                        aria-label="Paste"
                        title="Paste"
                        onClick={this.handlePaste()}
                        disabled={this.props.clipboardItemsCount === 0 || this.props.disabled}
                        color={buttonColor}
                    >
                        {this.addBadgeIfNotEmpty(
                            this.props.clipboardItemsCount,
                            <ContentPaste />
                        )}
                    </IconButton>
                    <CreateDirectoryButton
                        onCreate={this.handleCreateDirectory()}
                    >
                        <IconButton
                            aria-label="Create directory"
                            title="Create directory"
                            disabled={this.props.disabled}
                            color={buttonColor}
                        >
                            <Icon>create_new_folder</Icon>
                        </IconButton>
                    </CreateDirectoryButton>
                    <UploadButton
                        onUpload={this.handleUpload()}
                        onDidUpload={this.props.refreshFiles}
                    >
                        <IconButton
                            title="Upload"
                            aria-label="Upload"
                            disabled={this.props.disabled}
                            color={buttonColor}
                        >
                            <Icon>cloud_upload</Icon>
                        </IconButton>
                    </UploadButton>
                </>
            );
    }
}

const mapStateToProps = state => ({
    selectedPaths: state.collectionBrowser.selectedPaths,
    clipboardItemsCount: state.clipboard.filenames ? state.clipboard.filenames.length : 0,
    creatingDirectory: state.cache.filesByPath.creatingDirectory
});

const mapDispatchToProps = {
    ...fileActions,
    ...clipboardActions
};

export default connect(mapStateToProps, mapDispatchToProps)(FileOperations);
