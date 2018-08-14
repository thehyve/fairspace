import React from 'react';
import classNames from 'classnames';
import CollectionList from "../CollectionList/CollectionList";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Typography from "@material-ui/core/Typography";
import { withStyles } from '@material-ui/core/styles';
import InformationDrawer from "../InformationDrawer/InformationDrawer";
import Config from "../../generic/Config/Config";
import FileBrowser from "../../filebrowser/FileBrowser";
import {withRouter} from "react-router-dom";
import styles from "./CollectionBrowser.styles";

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

            collections: [],
            selectedCollection: null,
            selectedPath: null,

            infoDrawerOpened: false,
            infoDrawerSelection: {}
        };
    }

    componentDidMount() {
        this.loadCollections()
            .then(collections => {
                // Check whether a collection has been selected before
                if(this.props.collection) {
                    let selectedCollections = collections.filter(collection => collection.name === this.props.collection);
                    if(selectedCollections.length > 0) {
                        this.setState({selectedCollection: selectedCollections[0], selectedPath: this.props.path});
                    }
                }
            })
    }

    componentWillUnmount() {
        this.isUnmounting = true;
    }

    componentWillReceiveProps(nextProps) {
        // Check whether a collection has been selected before
        if(nextProps.collection) {
            let selectedCollections = this.state.collections.filter(collection => collection.name === nextProps.collection);
            if(selectedCollections.length > 0) {
                this.setState({selectedCollection: selectedCollections[0], selectedPath: nextProps.path});
            }
        } else {
            this.setState({selectedCollection: null});
        }

    }

    loadCollections() {
        this.setState({loading: true});

        return this.collectionStore
            .getCollections()
            .then(collections => {
                if (this.isUnmounting) {
                    return;
                }

                return this.metadataStore
                    .getCollectionMetadata(collections.map(collection => collection.name))
                    .then((metadata) => {
                        if (this.isUnmounting) {
                            return;
                        }

                        const lookupCollectionMetadata = (name) => {
                            const collectionUri = this.metadataStore.createUri(name);
                            const foundMetadata = metadata.filter((item) => item.uri === collectionUri);
                            return foundMetadata.length > 0 ? foundMetadata[0] : {};
                        }

                        // Merge metadata with collections
                        const mergedCollections = collections.map(collection => ({
                            ...collection,
                                metadata: lookupCollectionMetadata(collection.name)
                        }));

                        this.setState({loading: false, collections: mergedCollections});
                        return mergedCollections;
                    });
            })
            .catch(err => {
                if (this.isUnmounting) {
                    return;
                }
                console.error("An error occurred while loading collections", err);
                this.setState({error: true, loading: false});
            });
    }

    generateId() {
        // TODO: Determine the best way to generate a new id
        return '' + (Math.random() * 10000000);
    }

    handleAddClick(e) {
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
                    // Load collections after creating a bucket
                    this.loadCollections();
                }).catch((e) => {
                    // Load collections as a new bucket has been created, but without metadata
                    this.loadCollections();
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
        this.setState({infoDrawerOpened: true, infoDrawerSelection: { collection: collection }});
    }

    handleCollectionDoubleClick(collection) {
        this.props.history.push("/collections/" + collection.name);
    }

    handleCollectionDetailsChange(collectionId, parameters) {
        // Update information about the name and collection
        this.metadataStore.updateCollectionMetadata({
            id: collectionId,
            name: parameters.name,
            description: parameters.description
        }).then(() => {
            // Update the currently selected collection
            this.setState({infoDrawerSelection: { collection: Object.assign({}, this.state.selectedCollection, { metadata: parameters})}});

            // Reload list of collections to ensure the latest version
            this.loadCollections();
        }).catch((e) => {
            // Load collections as a new bucket has been created, but without metadata
            this.loadCollections();
            this.closeDrawer();
            console.error("An error occurred while updating collection metadata", e);
        });
    }

    openDrawer() {
        this.setState({infoDrawerOpened: true});
    }

    closeDrawer() {
        this.setState({infoDrawerOpened: false});
    }

    render() {
        const {selectedCollection, infoDrawerOpened, infoDrawerSelection} = this.state;
        const {classes} = this.props;

        let mainPanel;

        if (selectedCollection) {
            mainPanel = this.showCollection(selectedCollection)
        } else {
            mainPanel = this.showCollections();
        }

        // Markup and title
        return (
            <div>
                <main className={classNames(
                    classes.content, {
                        [classes.contentShift]: infoDrawerOpened
                    }
                )}>
                    {mainPanel}
                </main>
                <InformationDrawer
                    open={infoDrawerOpened}
                    collection={infoDrawerSelection.collection}
                    onClose={this.handleCloseInfoDrawer.bind(this)}
                    onChangeDetails={this.handleCollectionDetailsChange.bind(this)}
                >
                </InformationDrawer>
            </div>
        );
    }

    showCollection(collection) {
        return (
            <FileBrowser
                baseUrl="/collections"
                collectionId={collection.name}
                collectionName={collection.metadata.name}
                prefix={collection.params.path}
                path={this.state.selectedPath} />
        )
    }

    showCollections() {
        // Actual contents
        let contents;
        if (this.state.loading) {
            contents = (<Typography variant="body2" paragraph={true} noWrap>Loading...</Typography>)
        } else if (this.state.error) {
            contents = (<Typography variant="body2" paragraph={true} noWrap>An error occurred</Typography>)
        } else {
            contents = (
                <div>
                    <CollectionList collections={this.state.collections}
                                    onCollectionClick={this.handleCollectionClick.bind(this)}
                                    onCollectionDoubleClick={this.handleCollectionDoubleClick.bind(this)}
                    />
                </div>)
        }

        // Markup and title
        return (
            <div>
                <Typography variant="title" paragraph={true}
                            noWrap>{'Collections overview'}</Typography>

                <Button variant="fab" color="primary" aria-label="Add" onClick={this.handleAddClick.bind(this)}>
                    <Icon>add</Icon>
                </Button>

                {contents}

            </div>
        );
    }
}

export default withStyles(styles)(withRouter(CollectionBrowser));



