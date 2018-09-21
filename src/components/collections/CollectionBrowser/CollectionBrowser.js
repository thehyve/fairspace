import React from 'react';
import {withRouter} from "react-router-dom";
import { connect } from 'react-redux';
import classNames from 'classnames';
import Typography from "@material-ui/core/Typography";
import {withStyles} from '@material-ui/core/styles';
import InformationDrawer from "../InformationDrawer/InformationDrawer";
import styles from "./CollectionBrowser.styles";
import BreadCrumbs from "../BreadCrumbs/BreadCrumbs";
import FileOverview from "../FileOverview/FileOverview";
import CollectionOverview from "../CollectionOverview/CollectionOverview";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import {Column, Row} from 'simple-flexbox';
import FileOperations from "../FileOperations/FileOperations";
import ErrorDialog from "../../error/ErrorDialog";
import ErrorMessage from "../../error/ErrorMessage";
import Clipboard from "./Clipboard";
import PermissionChecker from "../../permissions/PermissionChecker";

class CollectionBrowser extends React.Component {
    constructor(props) {
        super(props);

        this.metadataAPI = props.metadataAPI;
        this.collectionAPI = props.collectionAPI;
        this.fileAPI = null;

        // Initialize state
        this.state = {
            clipboard: new Clipboard(this.fileAPI),
            loading: false,
            error: false,

            selectedCollection: null,
            selectedPath: null,

            openedCollection: null,
            openedPath: null,

            infoDrawerOpened: false,
            infoDrawerSelection: {}
        };
    }

    componentDidMount() {
        // Check whether a collection has been selected before
        if (this.props.collection) {
            this.openCollectionAndPath(this.props.collection, this.props.path);
        }
    }

    componentWillUnmount() {
        this.isUnmounting = true;
    }

    componentWillReceiveProps(nextProps) {
        // Check whether a collection has been selected before
        // If so, find the proper collection information (e.g. metadata) from the list of
        // collections
        if (nextProps.collection) {
            this.openCollectionAndPath(nextProps.collection, nextProps.path);
        } else {
            this.closeCollections();
        }
    }

    setFileAPI(fileAPI) {
        // Only update the fileAPI if it actually has changed
        if (!this.fileAPI || fileAPI.basePath !== this.fileAPI.basePath) {
            this.fileAPI = fileAPI;
            this.setState({clipboard: new Clipboard(fileAPI)})
        }
    }

    openCollectionAndPath(selectedCollectionId, openedPath) {
        if (selectedCollectionId) {
            // Retrieve collection details
            this.collectionAPI
                .getCollection(selectedCollectionId)
                .then(collection => {
                    this.setFileAPI(this.props.fileAPIFactory.build(collection));
                    this.setState({
                        openedCollection: collection,
                        selectedCollection: collection,
                        openedPath: openedPath,
                        selectedPath: []
                    });
                })
                .catch(e => {
                    this.setState({error: true, loading: false});
                });
        } else {
            this.setState({error: false, openedCollection: null, openedPath: openedPath, selectedPath: []});
        }
    }

    closeCollections() {
        this.setState({error: false, openedCollection: null});
    }

    handleAddCollectionClick() {
        const {user} = this.props;
        const name = `${user.fullName}'s collection`;
        const description = "Beyond the horizon";

        // Create the bucket in storage
        this.collectionAPI
            .addCollection(name, description)
            .then(this.requireRefresh.bind(this))
            .catch(err => {
                const errorMessage = "An error occurred while creating a collection";
                this.setState({loading: false});
                ErrorDialog.showError(err, errorMessage, this.handleAddCollectionClick.bind(this));
            });
    }

    handleCloseInfoDrawer(e) {
        this.closeDrawer();
    }

    handleCollectionClick(collection) {
        // If this collection is already selected, deselect
        if (this.state.selectedCollection && this.state.selectedCollection.id === collection.id) {
            this.deselectCollection();
        } else {
            this.selectCollection(collection);
        }
    }

    handleCollectionDelete(collection) {
        // If this collection is already selected, deselect
        if (this.state.selectedCollection && this.state.selectedCollection.id === collection.id) {
            this.deselectCollection();
        }
    }

    handleCollectionDoubleClick(collection) {
        this.openCollection(collection);
    }

    handlePathClick(path) {
        // If this pathis already selected, deselect
        if (this.isPathSelected(path)) {
            this.deselectPath(path);
        } else {
            this.selectPath(path);
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
        return this.deleteFile(path.basename)
            .then(this.requireRefresh.bind(this))
            .catch(err => {
                ErrorDialog.showError(err, "An error occurred while deleting file or directory", () => this.handlePathDelete(path));
            });

    }

    handlePathRename(path, newName) {
        return this.renameFile(path.basename, newName)
            .then(this.requireRefresh.bind(this))
            .then(() => true)
            .catch(err => {
                ErrorDialog.showError(err, "An error occurred while renaming file or directory", () => this.handlePathRename(path, newName));
                return false;
            });

    }

    handleDidCollectionDetailsChange(collection) {
        // Update the currently selected collection
        this.setState({selectedCollection: collection});

        // Reload list of collections to ensure the latest version
        this.requireRefresh();
    }

    handleDidLoad() {
        this.setState({refreshRequired: false});
    }

    handleDidFileOperation() {
        this.requireRefresh();
    }

    handleCut() {
        this.setState({
            clipboard: this.state.clipboard.cut(this.state.openedPath, this.state.selectedPath)
        })
    }

    handleCopy() {
        this.setState({
            clipboard: this.state.clipboard.copy(this.state.openedPath, this.state.selectedPath)
        })
    }

    handlePaste() {
        this.state.clipboard
            .paste(this.state.openedPath)
            .then(() => this.setState({ clipboard: this.state.clipboard.clear() }))
            .catch(err => {
                ErrorDialog.showError(err, "An error occurred while pasting your contents");
            })
            .then(this.requireRefresh.bind(this));
    }

    requireRefresh() {
        this.setState({refreshRequired: true});
    }

    openDrawer() {
        this.setState({infoDrawerOpened: true});
    }

    closeDrawer() {
        this.setState({infoDrawerOpened: false});
    }

    selectCollection(collection) {
        this.setState({infoDrawerOpened: true, selectedCollection: collection})
    }

    deselectCollection() {
        this.setState({selectedCollection: null})
    }

    selectPath(path) {
        this.setState({
            infoDrawerOpened: true,
            selectedCollection: this.state.openedCollection,
            selectedPath: [...this.state.selectedPath, path]
        })
    }

    deselectPath(path) {
        this.setState({
            selectedPath: this.state.selectedPath.filter(el => el.filename !== path.filename)
        });
    }

    isPathSelected(path) {
        return this.state.selectedPath.some(el => el.filename === path.filename);
    }

    openCollection(collection) {
        this.props.history.push("/collections/" + collection.id);
    }

    openDir(path) {
        const basePath = this.state.openedPath || '';
        this.props.history.push("/collections/" + this.state.openedCollection.id + basePath + '/' + path);
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
        return this.fileAPI.joinPaths(this.state.openedPath || '', path);
    }

    // Parse path into array
    parsePath(path) {
        if (!path)
            return [];

        if (path[0] === '/')
            path = path.slice(1);

        return path ? path.split('/') : [];
    }

    render() {
        const {openedCollection, openedPath, infoDrawerOpened, selectedCollection, selectedPath} = this.state;
        const {classes} = this.props;

        if (this.state.error) {
            return this.renderError(this.state.error);
        }

        // The screen consists of 3 parts:
        // - a list of breadcrumbs
        // - an overview of items (mainPanel)
        // - an infodrawer

        let breadCrumbs = this.renderBreadCrumbs(openedCollection, openedPath);
        let buttons = this.renderButtons(openedCollection, openedPath, selectedPath);

        let mainPanel;
        if (this.state.loading) {
            mainPanel = this.renderLoading()
        } else if (openedCollection) {
            mainPanel = this.renderCollection(openedCollection)
        } else {
            mainPanel = this.renderCollectionList();
        }

        // Markup and title
        return (
            <div>
                <main className={classNames(
                    classes.content, {
                        [classes.contentShift]: infoDrawerOpened
                    }
                )}>
                    <Row>
                        <Column flexGrow={1} vertical='center' horizontal='start'>
                            <div>
                                {breadCrumbs}
                            </div>
                        </Column>
                        <Row>
                            {buttons}
                        </Row>
                    </Row>

                    {mainPanel}
                </main>
                <InformationDrawer
                    open={infoDrawerOpened}
                    collection={selectedCollection}
                    path={selectedPath}
                    onClose={this.handleCloseInfoDrawer.bind(this)}
                    onDidChangeDetails={this.handleDidCollectionDetailsChange.bind(this)}
                    collectionAPI={this.collectionAPI}
                    metadataAPI={this.metadataAPI}
                >
                </InformationDrawer>
            </div>
        );
    }

    renderBreadCrumbs(openedCollection, openedPath) {
        let pathSegments = [];
        const toBreadcrumb = segment => ({segment: segment, label: segment})
        if (openedCollection) {
            pathSegments.push({segment: openedCollection.id, label: openedCollection.name});
            pathSegments.push(...this.parsePath(openedPath).map(toBreadcrumb));
        }

        return (<BreadCrumbs
            homeUrl={this.baseUrl}
            segments={pathSegments}/>)
    }

    renderButtons(openedCollection, openedPath, selection) {
        if(openedCollection) {
            return <FileOperations
                        path={openedPath}
                        selection={selection}
                        fileAPI={this.fileAPI}
                        onCut={this.handleCut.bind(this)}
                        onCopy={this.handleCopy.bind(this)}
                        onPaste={this.handlePaste.bind(this)}
                        onDidFileOperation={this.handleDidFileOperation.bind(this)}
                        numClipboardItems={this.state.clipboard.getNumItems()}
                        disabled={!PermissionChecker.canWrite(openedCollection)} />
        } else {
            return <Button variant="fab" mini color="secondary" aria-label="Add"
                            onClick={this.handleAddCollectionClick.bind(this)}>
                        <Icon>add</Icon>
                    </Button>
        }
    }

    renderError(errorMessage) {
        return (<ErrorMessage message={errorMessage} />);
    }

    renderLoading() {
        return (<Typography variant="body2" paragraph={true} noWrap>Loading...</Typography>);
    }

    renderCollection(collection) {
        return (
            <FileOverview
                prefix={"/" + collection.location}
                path={this.state.openedPath}
                selectedPath={this.state.selectedPath}
                refreshFiles={this.state.refreshRequired}
                fileAPI={this.fileAPI}
                onFilesDidLoad={this.handleDidLoad.bind(this)}
                onPathClick={this.handlePathClick.bind(this)}
                onPathDoubleClick={this.handlePathDoubleClick.bind(this)}
                onPathDelete={this.handlePathDelete.bind(this)}
                onPathRename={this.handlePathRename.bind(this)}
            />
        )
    }

    renderCollectionList() {
        return (
            <CollectionOverview
                collectionAPI={this.collectionAPI}
                selectedCollection={this.state.selectedCollection}
                refreshCollections={this.state.refreshRequired}
                onCollectionsDidLoad={this.handleDidLoad.bind(this)}
                onCollectionClick={this.handleCollectionClick.bind(this)}
                onCollectionDoubleClick={this.handleCollectionDoubleClick.bind(this)}
                onCollectionDelete={this.handleCollectionDelete.bind(this)}
            />);
    }
}

const mapStateToProps = state => {
    return {
        user: state.account.user.item
    }
}

export default connect(mapStateToProps)(withStyles(styles)(withRouter(CollectionBrowser)));



