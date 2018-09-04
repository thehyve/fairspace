import React from 'react';
import ErrorDialog from "../../error/ErrorDialog";
import UploadButton from "../buttons/UploadButton/UploadButton";
import CreateDirectoryButton from "../buttons/CreateDirectoryButton/CreateDirectoryButton";
import Icon from "@material-ui/core/Icon";

function FileOperations(props) {
    const {fileStore, path, selection, onDidFileOperation} = props;

    function handleUpload(files) {
        if (files && files.length > 0) {
            return fileStore
                .upload(selection, files)
                .catch(err => {
                    ErrorDialog.showError(err, "An error occurred while uploading files", () => handleUpload(files));
                });
        } else {
            return Promise.resolve();
        }
    }

    function handleCreateDirectory(name) {
        return fileStore
            .createDirectory(fileStore.joinPaths(path, name))
            .then(onDidFileOperation)
            .catch(err => {
                if(err.status === 405) {
                    // Directory already exists
                    ErrorDialog.showError(err, "A directory or file with this name already exists. Please choose another name");
                    throw err;
                } else {
                    ErrorDialog.showError(err, "An error occurred while creating directory", () => handleCreateDirectory(name));
                }
            });
    }

    return (<React.Fragment>
        <CreateDirectoryButton
            aria-label="Create directory"
            onCreate={handleCreateDirectory}>
            <Icon>add</Icon>
        </CreateDirectoryButton>

        <UploadButton
            color="primary"
            aria-label="Upload"
            onUpload={handleUpload}
            onDidUpload={onDidFileOperation}>
            <Icon>cloud_upload</Icon>
        </UploadButton>
    </React.Fragment>)
}

export default FileOperations;