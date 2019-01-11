import React from 'react';
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import {ContentCopy, ContentCut, ContentPaste} from "mdi-material-ui";
import Badge from "@material-ui/core/Badge";
import {connect} from 'react-redux';
import CreateDirectoryButton from "../common/buttons/CreateDirectoryButton";
import UploadButton from "../common/buttons/UploadButton";
import ErrorDialog from "../common/ErrorDialog";
import LoadingOverlay from '../common/LoadingOverlay';
import * as clipboardActions from "../../actions/clipboard";
import * as fileActions from "../../actions/files";
import {uniqueName} from "../../utils/fileutils";

function FileOperations(props) {
    const {
        numClipboardItems, disabled, creatingDirectory,
        openedPath, selectedPaths, openedCollection,
        fetchFilesIfNeeded, uploadFiles, createDirectory,
        cut, copy, paste, existingFiles
    } = props;

    function refreshFiles() {
        fetchFilesIfNeeded(openedCollection, openedPath);
    }

    function handleCut(e) {
        e.stopPropagation();
        cut(openedPath, selectedPaths);
    }

    function handleCopy(e) {
        e.stopPropagation();
        copy(openedPath, selectedPaths);
    }

    function handlePaste(e) {
        e.stopPropagation();
        paste(openedCollection, openedPath)
            .then(refreshFiles)
            .catch((err) => {
                ErrorDialog.showError(err, "An error occurred while pasting your contents");
            });
    }

    function handleUpload(files) {
        if (files && files.length > 0) {
            const nameMapping = new Map();
            files.forEach(file => nameMapping.set(file.name, uniqueName(file.name, existingFiles)));
            return uploadFiles(openedCollection, openedPath, files, nameMapping)
                .then(() => files)
                .catch((err) => {
                    ErrorDialog.showError(err, "An error occurred while uploading files", () => handleUpload(files));
                });
        }
        return Promise.resolve([]);
    }

    function handleCreateDirectory(name) {
        return createDirectory(openedCollection, openedPath, name)
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

    return creatingDirectory
        ? <LoadingOverlay loading={creatingDirectory} />
        : (
            <>
                <IconButton
                    aria-label="Copy"
                    title="Copy"
                    onClick={handleCopy}
                    disabled={selectedPaths.length === 0 || disabled}
                >
                    <ContentCopy />
                </IconButton>
                <IconButton
                    aria-label="Cut"
                    title="Cut"
                    onClick={handleCut}
                    disabled={selectedPaths.length === 0 || disabled}
                >
                    <ContentCut />
                </IconButton>
                <IconButton
                    aria-label="Paste"
                    title="Paste"
                    onClick={handlePaste}
                    disabled={numClipboardItems === 0 || disabled}
                >
                    {addBadgeIfNotEmpty(
                        numClipboardItems,
                        <ContentPaste />
                    )}
                </IconButton>
                <CreateDirectoryButton
                    aria-label="Create directory"
                    title="Create directory"
                    onCreate={name => handleCreateDirectory(name)}
                    disabled={disabled}
                >
                    <Icon>create_new_folder</Icon>
                </CreateDirectoryButton>

                <UploadButton
                    color="primary"
                    aria-label="Upload"
                    title="Upload"
                    onUpload={files => handleUpload(files)}
                    onDidUpload={refreshFiles}
                    disabled={disabled}
                >
                    <Icon>cloud_upload</Icon>
                </UploadButton>
            </>
        );
}

const mapStateToProps = state => ({
    selectedPaths: state.collectionBrowser.selectedPaths,
    numClipboardItems: state.clipboard.filenames ? state.clipboard.filenames.length : 0,
    creatingDirectory: state.cache.filesByCollectionAndPath.creatingDirectory
});

const mapDispatchToProps = {
    ...fileActions,
    ...clipboardActions
};

export default connect(mapStateToProps, mapDispatchToProps)(FileOperations);
