import React from 'react';
import {withRouter} from "react-router-dom";
import classNames from 'classnames';
import Typography from "@material-ui/core/Typography";
import {withStyles} from '@material-ui/core/styles';
import InformationDrawer from "../InformationDrawer/InformationDrawer";
import Config from "../../generic/Config/Config";
import styles from "./CollectionBrowser.styles";
import BreadCrumbs from "../BreadCrumbs/BreadCrumbs";
import FileOverview from "../FileOverview/FileOverview";
import CollectionOverview from "../CollectionOverview/CollectionOverview";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import {Column, Row} from 'simple-flexbox';
import UploadButton from "../UploadButton/UploadButton";
import FileStore from "../../../services/FileStore/FileStore";

class CollectionBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.metadataStore = props.metadataStore;
        this.collectionStore = props.collectionStore;
        this.fileStore = null;

        // Initialize state
        this.state = {
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
        if(this.props.collection) {
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
        if(nextProps.collection) {
            this.openCollectionAndPath(nextProps.collection, nextProps.path);
        } else {
            this.closeCollections();
        }
    }

    openCollectionAndPath(selectedCollectionId, selectedPath) {
        if(selectedCollectionId) {
            // Retrieve collection details
            this.collectionStore
                .getCollection(selectedCollectionId)
                .then(collection => {
                    this.fileStore = new FileStore(collection);
                    this.setState({openedCollection: collection, openedPath: selectedPath});
                })
                .catch(e => {
                    this.setState({loading: false, error: true});
                });
        } else {
            this.setState({error: false, openedCollection: null, openedPath: selectedPath});
        }
    }

    closeCollections() {
        this.setState({error: false, openedCollection: null});
    }

    handleAddCollectionClick() {
        const name = Config.get().user.username + "'s collection";
        const description = "Beyond the horizon";

        // Create the bucket in storage
        this.collectionStore
            .addCollection(name, description)
            .then(this.requireRefresh)
            .catch(err => {
                console.error("An error occurred while creating a collection", err);
            });
    }

    handleCloseInfoDrawer(e) {
        this.closeDrawer();
    }

    handleCollectionClick(collection) {
        // If this collection is already selected, deselect
        if(this.state.selectedCollection && this.state.selectedCollection.id === collection.id) {
            this.deselectCollection();
        } else {
            this.selectCollection(collection);
        }
    }

    handleCollectionDoubleClick(collection) {
        this.openCollection(collection);
    }

    handlePathClick(path) {
        // If this pathis already selected, deselect
        if(this.state.selectedPath && this.state.selectedPath.filename === path.filename) {
            this.deselectPath();
        } else {
            this.selectPath(path);
        }
    }

    handlePathDoubleClick(path) {
        if(path.type === 'directory') {
            this.openDir(path.filename);
        } else {
            this.downloadFile(path.filename);
        }
    }

    handleDidCollectionDetailsChange(collectionId, parameters) {
        // Update the currently selected collection
        this.setState({selectedCollection: Object.assign({}, this.state.selectedCollection, { metadata: parameters})});

        // Reload list of collections to ensure the latest version
        if(!this.state.selectedCollection) {
            this.requireRefresh();
        }
    }

    handleUpload(files) {
        if(files && files.length > 0) {
            this.fileStore
                .upload(this.state.openedPath, files)
                .catch(err => {
                    console.error("An error occurred while uploading files", err);
                });
        }
    }

    handleDidLoad() {
        this.setState({refreshRequired: false});
    }

    handleDidUpload() {
        this.requireRefresh();
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
            selectedPath: path
        })
    }

    deselectPath() {
        this.setState({selectedPath: null})
    }


    openCollection(collection) {
        this.props.history.push("/collections/" + collection.id);
    }

    openDir(path) {
        const pathWithinCollection = this.fileStore.getPathWithinCollection(path);
        this.props.history.push("/collections/" + this.state.openedCollection.id + pathWithinCollection);
    }

    downloadFile(path) {
        this.fileStore.download(path);
    }

    // Parse path into array
    parsePath(path) {
        if(!path)
            return [];

        if(path[0] === '/')
            path = path.slice(1);

        return path ? path.split('/') : [];
    }

    render() {
        const {openedCollection, openedPath, infoDrawerOpened, selectedCollection, selectedPath} = this.state;
        const {classes} = this.props;

        // The screen consists of 3 parts:
        // - a list of breadcrumbs
        // - an overview of items (mainPanel)
        // - an infodrawer

        let breadCrumbs = this.renderBreadCrumbs(openedCollection, openedPath);
        let buttons = this.renderButtons(openedCollection, openedPath);

        let mainPanel;
        if (this.state.loading) {
            mainPanel = this.renderLoading()
        } else if (this.state.error) {
            mainPanel = this.renderError()
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
                        <Column>
                            {buttons}
                        </Column>
                    </Row>

                    {mainPanel}
                </main>
                <InformationDrawer
                    open={infoDrawerOpened}
                    collection={selectedCollection}
                    path={selectedPath}
                    onClose={this.handleCloseInfoDrawer.bind(this)}
                    onDidChangeDetails={this.handleDidCollectionDetailsChange.bind(this)}
                    metadataStore={this.metadataStore}
                >
                </InformationDrawer>
            </div>
        );
    }

    renderBreadCrumbs(selectedCollection, selectedPath) {
        let pathSegments = [];
        if(selectedCollection) {
            pathSegments.push({segment: selectedCollection.id, label: selectedCollection.metadata.name});
            pathSegments.push(...this.parsePath(selectedPath));
        }

        return (<BreadCrumbs
            homeUrl={this.baseUrl}
            segments={pathSegments} />)
    }

    renderButtons(selectedCollection, selectedPath) {
        return this.renderAddButton(selectedCollection);
    }

    renderAddButton(selectedCollection) {
        if(selectedCollection) {
            return (<UploadButton
                variant="fab"
                mini
                color="secondary"
                aria-label="Upload"
                onUpload={this.handleUpload.bind(this)}
                onDidUpload={this.handleDidUpload.bind(this)}>
                <Icon>cloud_upload</Icon>
            </UploadButton>)
        } else {
            return (<Button variant="fab" mini color="secondary" aria-label="Add" onClick={this.handleAddCollectionClick.bind(this)}>
                    <Icon>add</Icon>
                </Button>)
        }
    }

    renderError() {
        return (<Typography variant="body2" paragraph={true} noWrap>An error occurred</Typography>);
    }

    renderLoading() {
        return (<Typography variant="body2" paragraph={true} noWrap>Loading...</Typography>);
    }

    renderCollection(collection) {
        return (
            <FileOverview
                prefix={"/" + collection.typeIdentifier}
                path={this.state.openedPath}
                selectedPath={this.state.selectedPath ? this.state.selectedPath.filename : null}
                refreshFiles={this.state.refreshRequired}
                fileStore={this.fileStore}
                onFilesDidLoad={this.handleDidLoad.bind(this)}
                onPathClick={this.handlePathClick.bind(this)}
                onPathDoubleClick={this.handlePathDoubleClick.bind(this)}
            />
        )
    }

    renderCollectionList() {
        return (
            <CollectionOverview
                            collectionStore={this.collectionStore}
                            selectedCollection={this.state.selectedCollection}
                            refreshCollections={this.state.refreshRequired}
                            onCollectionsDidLoad={this.handleDidLoad.bind(this)}
                            onCollectionClick={this.handleCollectionClick.bind(this)}
                            onCollectionDoubleClick={this.handleCollectionDoubleClick.bind(this)}
            />);
    }
}

export default withStyles(styles)(withRouter(CollectionBrowser));



