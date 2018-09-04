import React from 'react';
import ErrorDialog from "../../error/ErrorDialog";
import UploadButton from "../buttons/UploadButton/UploadButton";
import CreateDirectoryButton from "../buttons/CreateDirectoryButton/CreateDirectoryButton";
import Icon from "@material-ui/core/Icon";

function FileOperations(props) {
    const {fileStore, path, selection, onDidFileOperation} = props;

    function handleUpload(path, files) {
        if (files && files.length > 0) {
            return fileStore
                .upload(path, files)
                .catch(err => {
                    ErrorDialog.showError(err, "An error occurred while uploading files", () => handleUpload(path, files));
                });
        } else {
            return Promise.resolve();
        }
    }

    function handleCreateDirectory(path, name) {
        console.log("Create directory within path", path);
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

    console.log("Render file operations for path ", path);

    return (<React.Fragment>
        <CreateDirectoryButton
            aria-label="Create directory"
            onCreate={(name) => handleCreateDirectory(path, name)}>
            <Icon>create_new_folder</Icon>
        </CreateDirectoryButton>

        <UploadButton
            color="primary"
            aria-label="Upload"
            onUpload={(files) => handleUpload(path, files)}
            onDidUpload={onDidFileOperation}>
            <Icon>cloud_upload</Icon>
        </UploadButton>
    </React.Fragment>)
}

export default FileOperations;