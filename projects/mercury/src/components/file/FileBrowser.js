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
    componentDidMount() {
        const {
            fetchCollectionsIfNeeded, selectCollection, fetchFilesIfNeeded, openedCollection, openedPath
        } = this.props;
        fetchCollectionsIfNeeded();
        selectCollection(openedCollection.id);

        // If the collection has not been fetched yet,
        // do not bother fetching the files
        if (openedCollection.id) {
            fetchFilesIfNeeded(openedCollection, openedPath);
        }
    }

    handlePathClick = (path) => {
        const {selectPath, deselectPath} = this.props;

        // If this pathis already selected, deselect
        if (this.isPathSelected(path.filename)) {
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

    isPathSelected(path) {
        return this.props.selectedPaths.some(el => el === path);
    }

    openCollection(collection) {
        this.props.history.push(`/collections/${collection.id}`);
    }

    openDir(path) {
        const basePath = this.props.openedPath || '';
        const separator = basePath.endsWith('/') ? '' : '/';
        const fullPath = `/collections/${this.props.openedCollection.id}${basePath}${separator}${path}`;
        this.props.history.push(fullPath);
        this.props.openPath(`/${this.props.openedCollection.location}${basePath}${separator}${path}`);
    }

    downloadFile(path) {
        const fileAPI = new FileAPI(this.props.openedCollection.location);
        fileAPI.download(joinPaths(this.props.openedPath || '', path));
    }

    render() {
        const {loading, error} = this.props;

        if (error) {
            return (<ErrorMessage message="An error occurred while loading files" />);
        }

        return (
            <>
                {loading ? <LoadingInlay /> : this.renderFiles()}
                {loading ? null : this.renderButtons()}
            </>
        );
    }

    renderButtons() {
        const {openedCollection, openedPath} = this.props;

        return (
            <FileOperations
                openedCollection={openedCollection}
                openedPath={openedPath}
                disabled={!canWrite(openedCollection)}
                existingFiles={this.props.files ? this.props.files.map(file => file.basename) : []}
            />
        );
    }

    renderFiles() {
        const doesCollectionExist = this.props.openedCollection && this.props.openedCollection.id;

        if (!doesCollectionExist) {
            return 'Collection does not exist.';
        }

        return (
            <FileList
                files={this.props.files}
                selectedPaths={this.props.selectedPaths}
                onPathClick={this.handlePathClick}
                onPathDoubleClick={this.handlePathDoubleClick}
                onRename={this.handlePathRename}
                onDelete={this.handlePathDelete}
                readonly={!canWrite(this.props.openedCollection)}
            />
        );
    }
}

export default withRouter(FileBrowser);
