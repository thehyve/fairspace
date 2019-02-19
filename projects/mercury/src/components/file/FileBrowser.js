import React from 'react';
import {withRouter} from "react-router-dom";

import {
    ErrorDialog, ErrorMessage,
    LoadingInlay
} from "../common";
import FileList from "./FileList";
import FileOperations from "./FileOperations";
import {canWrite} from '../../utils/permissionUtils';
import FileAPI from "../../services/FileAPI";
import {joinPaths} from "../../utils/fileUtils";

class FileBrowser extends React.Component {
    handlePathClick = (path) => {
        const {selectPath, deselectPath} = this.props;
        const isPathSelected = this.props.selectedPaths.some(el => el === path.filename);

        // If this pathis already selected, deselect
        if (isPathSelected) {
            deselectPath(path.filename);
        } else {
            selectPath(path.filename);
        }
    }

    handlePathDoubleClick = (path) => {
        if (path.type === 'directory') {
            this.openDir(path.basename);
        } else {
            this.downloadFile(path.basename);
        }
    }

    handlePathDelete = (path) => {
        const {
            deleteFile, fetchFilesIfNeeded, openedCollection, openedPath
        } = this.props;

        return deleteFile(openedCollection, openedPath, path.basename)
            .then(() => fetchFilesIfNeeded(openedCollection, openedPath))
            .catch((err) => {
                ErrorDialog.showError(err, "An error occurred while deleting file or directory", () => this.handlePathDelete(path));
            });
    }

    handlePathRename = (path, newName) => {
        const {
            renameFile, fetchFilesIfNeeded, openedCollection, openedPath
        } = this.props;

        return renameFile(openedCollection, openedPath, path.basename, newName)
            .then(() => fetchFilesIfNeeded(openedCollection, openedPath))
            .catch((err) => {
                ErrorDialog.showError(err, "An error occurred while renaming file or directory", () => this.handlePathRename(path, newName));
                return false;
            });
    }

    openDir(path) {
        const basePath = this.props.openedPath || '';
        const separator = basePath.endsWith('/') ? '' : '/';
        const fullPath = `/collections/${this.props.openedCollection.location}${basePath}${separator}${path}`;
        this.props.history.push(fullPath);
        this.props.openPath(`/${this.props.openedCollection.location}${basePath}${separator}${path}`);
    }

    downloadFile(path) {
        const fileAPI = new FileAPI(this.props.openedCollection.location);
        fileAPI.download(joinPaths(this.props.openedPath || '', path));
    }

    render() {
        const {loading, error, openedCollection, files, selectedPaths, openedPath} = this.props;
        const collectionExists = openedCollection && openedCollection.iri;

        if (error) {
            return (<ErrorMessage message="An error occurred while loading files" />);
        }

        if (loading) {
            return <LoadingInlay />;
        }

        return (
            <>
                {collectionExists
                    ? (
                        <FileList
                            files={files}
                            selectedPaths={selectedPaths}
                            onPathClick={this.handlePathClick}
                            onPathDoubleClick={this.handlePathDoubleClick}
                            onRename={this.handlePathRename}
                            onDelete={this.handlePathDelete}
                            readonly={!canWrite(openedCollection)}
                        />
                    ) : 'Collection does not exist.'
                }
                <FileOperations
                    openedCollection={openedCollection}
                    openedPath={openedPath}
                    disabled={!canWrite(openedCollection)}
                    existingFiles={this.props.files ? this.props.files.map(file => file.basename) : []}
                />
            </>
        );
    }
}

export default withRouter(FileBrowser);
