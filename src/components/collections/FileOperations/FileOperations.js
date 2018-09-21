import React from 'react';
import ErrorDialog from "../../error/ErrorDialog";
import UploadButton from "../buttons/UploadButton/UploadButton";
import CreateDirectoryButton from "../buttons/CreateDirectoryButton/CreateDirectoryButton";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import {ContentCopy, ContentCut, ContentPaste} from "mdi-material-ui";
import Badge from "@material-ui/core/Badge";

function FileOperations(props) {
    const {fileAPI, path, onDidFileOperation, onCut, onCopy, onPaste, numClipboardItems, selection, disabled} = props;

    function handleCut(e) {
        e.stopPropagation()
        onCut()
    }
    function handleCopy(e) {
        e.stopPropagation()
        onCopy()
    }
    function handlePaste(e) {
        e.stopPropagation()
        onPaste();
    }

    function handleUpload(path, files) {
        if (files && files.length > 0) {
            return fileAPI
                .upload(path, files)
                .catch(err => {
                    ErrorDialog.showError(err, "An error occurred while uploading files", () => handleUpload(path, files));
                });
        } else {
            return Promise.resolve([]);
        }
    }

    function handleCreateDirectory(path, name) {
        return fileAPI
            .createDirectory(fileAPI.joinPaths(path, name))
            .then(onDidFileOperation)
            .then(() => true)
            .catch(err => {
                if(err.status === 405) {
                    // Directory already exists
                    ErrorDialog.showError(err, "A directory or file with this name already exists. Please choose another name");
                    return false;
                } else {
                    ErrorDialog.showError(err, "An error occurred while creating directory", () => handleCreateDirectory(name));
                    return true;
                }
            });
    }

    function addBadgeIfNotEmpty(badgeContent, children) {
        if(badgeContent) {
            return <Badge badgeContent={badgeContent} color="primary">
                {children}
            </Badge>
        } else {
            return children;
        }
    }

    return (<React.Fragment>
        <IconButton
            aria-label="Copy"
            onClick={handleCopy}
            disabled={selection.length === 0 || disabled}>
            <ContentCopy/>
        </IconButton>
        <IconButton
            aria-label="Cut"
            onClick={handleCut}
            disabled={selection.length === 0 || disabled}>
            <ContentCut/>
        </IconButton>
        <IconButton
            aria-label="Paste"
            onClick={handlePaste}
            disabled={numClipboardItems === 0 || disabled}>
            {addBadgeIfNotEmpty(
                numClipboardItems,
                <ContentPaste/>
            )}
        </IconButton>
        <CreateDirectoryButton
            aria-label="Create directory"
            onCreate={(name) => handleCreateDirectory(path, name)}
            disabled={disabled}>
            <Icon>create_new_folder</Icon>
        </CreateDirectoryButton>

        <UploadButton
            color="primary"
            aria-label="Upload"
            onUpload={(files) => handleUpload(path, files)}
            onDidUpload={onDidFileOperation}
            disabled={disabled}>
            <Icon>cloud_upload</Icon>
        </UploadButton>
    </React.Fragment>)
}

export default FileOperations;
