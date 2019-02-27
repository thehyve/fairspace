import React from 'react';
import {connect} from 'react-redux';
import {Icon, IconButton, Badge} from "@material-ui/core";
import {ContentCopy, ContentCut, ContentPaste} from "mdi-material-ui";

import {CreateDirectoryButton, UploadButton, ErrorDialog, LoadingOverlay} from "../common";
import * as clipboardActions from "../../actions/clipboardActions";
import * as fileActions from "../../actions/fileActions";
import {joinPaths, uniqueName} from "../../utils/fileUtils";

function FileOperations(props) {
    const {
        clipboardItemsCount, disabled, creatingDirectory,
        openedPath, selectedPaths,
        fetchFilesIfNeeded, uploadFiles, createDirectory,
        cut, copy, paste, existingFiles
    } = props;

    function refreshFiles() {
        fetchFilesIfNeeded(openedPath);
    }

    function handleCut(e) {
        e.stopPropagation();
        cut(selectedPaths);
    }

    function handleCopy(e) {
        e.stopPropagation();
        copy(selectedPaths);
    }

    function handlePaste(e) {
        e.stopPropagation();
        paste(openedPath)
            .then(refreshFiles)
            .catch((err) => {
                ErrorDialog.showError(err, "An error occurred while pasting your contents");
            });
    }

    function handleUpload(files) {
        if (files && files.length > 0) {
            const nameMapping = new Map();
            files.forEach(file => nameMapping.set(file.name, uniqueName(file.name, existingFiles)));
            return uploadFiles(openedPath, files, nameMapping)
                .then(refreshFiles)
                .catch((err) => {
                    ErrorDialog.showError(err, "An error occurred while uploading files", () => handleUpload(files));
                });
        }
        return Promise.resolve([]);
    }

    function handleCreateDirectory(name) {
        return createDirectory(joinPaths(openedPath, name))
            .then(refreshFiles)
            .catch((err) => {
                if (err.status === 405) {
                    // Directory already exists
                    ErrorDialog.showError(err, "A directory or file with this name already exists. Please choose another name");
                    return false;
                }
                ErrorDialog.showError(err, "An error occurred while creating directory", () => handleCreateDirectory(name));
                return true;
            });
    }

    function addBadgeIfNotEmpty(badgeContent, children) {
        if (badgeContent) {
            return (
                <Badge badgeContent={badgeContent} color="primary">
                    {children}
                </Badge>
            );
        }
        return children;
    }

    const buttonColor = disabled ? 'default' : 'secondary';
    const noSelectedPath = selectedPaths.length === 0;

    return creatingDirectory
        ? <LoadingOverlay loading={creatingDirectory} />
        : (
            <>
                <IconButton
                    aria-label="Copy"
                    title="Copy"
                    onClick={handleCopy}
                    disabled={noSelectedPath || disabled}
                    color={buttonColor}
                >
                    <ContentCopy />
                </IconButton>
                <IconButton
                    aria-label="Cut"
                    title="Cut"
                    onClick={handleCut}
                    disabled={noSelectedPath || disabled}
                    color={buttonColor}
                >
                    <ContentCut />
                </IconButton>
                <IconButton
                    aria-label="Paste"
                    title="Paste"
                    onClick={handlePaste}
                    disabled={clipboardItemsCount === 0 || disabled}
                    color={buttonColor}
                >
                    {addBadgeIfNotEmpty(
                        clipboardItemsCount,
                        <ContentPaste />
                    )}
                </IconButton>
                <CreateDirectoryButton
                    onCreate={handleCreateDirectory}
                >
                    <IconButton
                        aria-label="Create directory"
                        title="Create directory"
                        disabled={disabled}
                        color={buttonColor}
                    >
                        <Icon>create_new_folder</Icon>
                    </IconButton>
                </CreateDirectoryButton>
                <UploadButton
                    onUpload={handleUpload}
                    onDidUpload={refreshFiles}
                >
                    <IconButton
                        title="Upload"
                        aria-label="Upload"
                        disabled={disabled}
                        color={buttonColor}
                    >
                        <Icon>cloud_upload</Icon>
                    </IconButton>
                </UploadButton>
            </>
        );
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
