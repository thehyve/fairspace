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

class CollectionBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.metadataStore = props.metadataStore;
        this.collectionStore = props.collectionStore;

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

    openCollectionAndPath(selectedCollectionName, selectedPath) {
        let collectionDetails = null;
        if(selectedCollectionName) {
            // Retrieve collection details
            // TODO: Make backend call
            collectionDetails = {
                name: selectedCollectionName,
                params: { path: '/' + selectedCollectionName },
                metadata: {
                    name: selectedCollectionName
                }
            };
        }
        this.setState({openedCollection: collectionDetails, openedPath: selectedPath});
    }

    closeCollections() {
        this.setState({openedCollection: null});
    }

    generateId() {
        // TODO: Determine the best way to generate a new id
        return '' + (Math.random() * 10000000);
    }

    handleAddClick() {
        const collectionId = this.generateId();

        // Create the bucket in storage
        this.collectionStore
            .addCollection(collectionId)
            .then(() => {
                // Store information about the name
                // TODO: Determine the default description to be set
                this.metadataStore.addCollectionMetadata({
                    id: collectionId,
                    name: Config.get().user.username + "'s collection",
                    description: "Beyond the horizon"
                }).then(() => {
                    // Reload collections after creating a new one
                    this.setState({refreshCollections: true});
                }).catch((e) => {
                    // Load collections as a new bucket has been created, but without metadata
                    this.setState({refreshCollections: true});
                    console.error("An error occurred while adding collection metadata", e);
                });
            })
            .catch(err => {
                console.error("An error occurred while creating a collection", err);
            });
    }

    handleCloseInfoDrawer(e) {
        this.closeDrawer();
    }

    handleCollectionClick(collection) {
        // If this collection is already selected, deselect
        if(this.state.selectedCollection && this.state.selectedCollection.name === collection.name) {
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
        if(this.state.selectedPath && this.state.selectedPath.id === path.id) {
            this.deselectPath();
        } else {
            this.selectPath(path);
        }
    }

    handlePathDoubleClick(path) {
        if(path.type === 'dir') {
            this.openDir(atob(path.id));
        }
    }

    handleDidCollectionDetailsChange(collectionId, parameters) {
        // Update the currently selected collection
        this.setState({selectedCollection: Object.assign({}, this.state.selectedCollection, { metadata: parameters})});

        // Reload list of collections to ensure the latest version
        this.loadCollections();
    }

    handleCollectionsDidLoad(collections) {
        this.setState({refreshCollections: false});
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
        this.props.history.push("/collections/" + collection.name);
    }

    openDir(path) {
        this.props.history.push("/collections/" + this.state.openedCollection.name + path);
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
            pathSegments.push({segment: selectedCollection.name, label: selectedCollection.metadata.name});
            pathSegments.push(...this.parsePath(selectedPath));
        }

        return (<BreadCrumbs
            homeUrl={this.baseUrl}
            segments={pathSegments} />)
    }

    renderButtons(selectedCollection, selectedPath) {
        return (
            <Button variant="fab" mini color="secondary" aria-label="Add" onClick={this.handleAddClick.bind(this)}>
                <Icon>add</Icon>
            </Button>)
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
                prefix={collection.params.path}
                path={this.state.openedPath}
                selectedPath={this.state.selectedPath ? this.state.selectedPath.id : null}
                onPathClick={this.handlePathClick.bind(this)}
                onPathDoubleClick={this.handlePathDoubleClick.bind(this)}
            />
        )
    }

    renderCollectionList() {
        return (
            <CollectionOverview
                            metadataStore={this.metadataStore}
                            collectionStore={this.collectionStore}
                            selectedCollection={this.state.selectedCollection}
                            refreshCollections={this.state.refreshCollections}
                            onCollectionsDidLoad={this.handleCollectionsDidLoad.bind(this)}
                            onCollectionClick={this.handleCollectionClick.bind(this)}
                            onCollectionDoubleClick={this.handleCollectionDoubleClick.bind(this)}
            />);
    }
}

export default withStyles(styles)(withRouter(CollectionBrowser));



