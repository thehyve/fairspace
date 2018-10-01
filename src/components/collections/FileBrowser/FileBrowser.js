import React from 'react';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import Typography from "@material-ui/core/Typography";
import BreadCrumbs from "../../generic/BreadCrumbs/BreadCrumbs";
import {Column, Row} from 'simple-flexbox';
import ErrorDialog from "../../error/ErrorDialog";
import ErrorMessage from "../../error/ErrorMessage";

import {deselectPath, openInfoDrawer, selectCollection, selectPath} from "../../../actions/collectionbrowser";
import FileList from "../FileList/FileList";
import {deleteFile, fetchFilesIfNeeded, renameFile} from "../../../actions/files";
import {fetchCollectionsIfNeeded} from "../../../actions/collections";
import FileOperations from "../FileOperations/FileOperations";
import PermissionChecker from "../../permissions/PermissionChecker";

class FileBrowser extends React.Component {
    componentDidMount() {
        this.props.dispatch(fetchCollectionsIfNeeded())
        this.props.dispatch(selectCollection(this.props.openedCollection))

        // If the collection has not been fetched yet,
        // do not bother fetching the files
        if(this.props.openedCollection.id) {
            this.props.dispatch(fetchFilesIfNeeded(this.props.openedCollection, this.props.openedPath))
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.openedCollection.id !== this.props.openedCollection.id) {
            this.props.dispatch(selectCollection(this.props.openedCollection))
        }

        const hasCollectionDetails = this.props.openedCollection.id;
        const hasNewOpenedCollection = prevProps.openedCollection.id !== this.props.openedCollection.id;
        const hasNewOpenedPath = prevProps.openedPath !== this.props.openedPath;

        if(hasCollectionDetails && (hasNewOpenedCollection || hasNewOpenedPath)) {
            this.props.dispatch(fetchFilesIfNeeded(this.props.openedCollection, this.props.openedPath))
        }
    }

    handlePathClick(path) {
        // If this pathis already selected, deselect
        if (this.isPathSelected(path.filename)) {
            this.props.dispatch(deselectPath(path.filename))
        } else {
            this.props.dispatch(selectPath(path.filename))
        }
    }

    handlePathDoubleClick(path) {
        if (path.type === 'directory') {
            this.openDir(path.basename);
        } else {
            this.downloadFile(path.basename);
        }
    }

    handlePathDelete(path) {
        return this.props.dispatch(deleteFile(this.props.openedCollection, this.props.openedPath, path.basename))
            .then(() => this.props.dispatch(fetchFilesIfNeeded(this.props.openedCollection, this.props.openedPath)))
            .catch(err => {
                ErrorDialog.showError(err, "An error occurred while deleting file or directory", () => this.handlePathDelete(path));
            });

    }

    handlePathRename(path, newName) {
        return this.props.dispatch(renameFile(this.props.openedCollection, this.props.openedPath, path.basename, newName))
            .then(() => this.props.dispatch(fetchFilesIfNeeded(this.props.openedCollection, this.props.openedPath)))
            .catch(err => {
                ErrorDialog.showError(err, "An error occurred while renaming file or directory", () => this.handlePathRename(path, newName));
                return false;
            });

    }

    openDrawer() {
        this.props.dispatch(openInfoDrawer())
    }

    isPathSelected(path) {
        return this.props.selectedPath.some(el => el === path);
    }

    openCollection(collection) {
        this.props.history.push("/collections/" + collection.id);
    }

    openDir(path) {
        const basePath = this.props.openedPath || '';
        this.props.history.push("/collections/" + this.props.openedCollection.id + basePath + '/' + path);
    }

    downloadFile(path) {
        this.fileAPI.download(this._getFullPath(path));
    }

    deleteFile(path) {
        return this.fileAPI.delete(this._getFullPath(path));
    }

    renameFile(current, newName) {
        return this.fileAPI.move(this._getFullPath(current), this._getFullPath(newName));
    }

    _getFullPath(path) {
        return this.fileAPI.joinPaths(this.props.openedPath || '', path);
    }

    render() {
        const {loading, error, openedCollection, openedPath, selectedPath} = this.props;

        // The screen consists of 3 parts:
        // - a list of breadcrumbs
        // - an overview of items (mainPanel)
        // - an infodrawer

        let buttons = null;
        let mainPanel;

        if (error) {
            return this.renderError(error);
        } else if (loading) {
            mainPanel = this.renderLoading()
        } else {
            buttons = this.renderButtons(openedCollection, openedPath, selectedPath);
            mainPanel = this.renderFiles();
        }

        // Markup and title
        return (
            <div>
                <Row>
                    <Column flexGrow={1} vertical='center' horizontal='start'>
                        <div>
                            {this.renderBreadcrumbs()}
                        </div>
                    </Column>
                    <Row>
                        <div>{buttons}</div>
                    </Row>
                </Row>

                {mainPanel}
            </div>
        );
    }

    renderBreadcrumbs() {
        const {openedCollection, openedPath} = this.props;

        let segments = [
            {segment: 'collections', label: 'Collections'},
            {segment: openedCollection.id, label: openedCollection.name}
        ];

        if(openedPath) {
            const toBreadcrumb = segment => ({segment: segment, label: segment})
            const pathParts = FileBrowser._parsePath(openedPath)
                segments.push(...pathParts.map(toBreadcrumb));
        }

        return <BreadCrumbs segments={segments}/>;
    }

    renderButtons(openedCollection, openedPath, selection) {
        return <FileOperations
                    openedCollection={openedCollection}
                    openedPath={openedPath}
                    disabled={!PermissionChecker.canWrite(openedCollection)} />
    }

    renderError(errorMessage) {
        return (<ErrorMessage message={"Error while loading files"} />);
    }

    renderLoading() {
        return (<Typography variant="body2" paragraph={true} noWrap>Loading...</Typography>);
    }

    renderFiles() {
        return <FileList
            files={this.props.files}
            selectedPath={this.props.selectedPath}
            onPathClick={this.handlePathClick.bind(this)}
            onPathDoubleClick={this.handlePathDoubleClick.bind(this)}
            onRename={this.handlePathRename.bind(this)}
            onDelete={this.handlePathDelete.bind(this)}/>
    }

    // Parse path into array
    static _parsePath(path) {
        if (!path)
            return [];

        if (path[0] === '/')
            path = path.slice(1);

        return path ? path.split('/') : [];
    }

}

const mapStateToProps = (state, ownProps) => {
    const {openedCollectionId, openedPath} = ownProps;

    const filesPerCollection = state.cache.filesByCollectionAndPath[openedCollectionId] || {};
    const files = filesPerCollection[openedPath] || {};
    const collections = state.cache.collections;

    const collectionBrowser = state.collectionBrowser;

    const getCollection = (collectionId) => {
        if(!collections.data || collections.data.length === 0) {
            return {}
        }

        return collections.data.find(collection => collection.id === collectionId) || {}
    }

    return {
        user: state.account.user.item,
        loading: files.pending || collections.pending || collections.data.length === 0,
        error: files.error || collections.error,
        files: files.data,

        selectedPath: collectionBrowser.selectedPath,
        openedCollection: openedCollectionId ? getCollection(openedCollectionId) : {}
    }
}

export default connect(mapStateToProps)(withRouter(FileBrowser));



