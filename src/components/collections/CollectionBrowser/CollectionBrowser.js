import React from 'react';
import CollectionList from "../CollectionList/CollectionList";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Typography from "@material-ui/core/Typography";
import InformationDrawer from "../InformationDrawer/InformationDrawer";
import Config from "../../generic/Config/Config";
import DirectoryBrowser from "./DirectoryBrowser";
import WithS3Client from "../../../backend/WithS3Client/WithS3Client";

class CollectionBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.s3Client = props.s3;
        this.metadataStore = props.metadataStore;

        // Initialize state
        this.state = {
            loading: false,
            error: false,

            collections: [],
            infoDrawerOpened: false,
            showDirectories: false,
            selectedCollection: null,
            metadata: null,
            vocabulary: null,
        };
    }

    componentDidMount() {
        this.loadCollections();
    }

    componentWillUnmount() {
        this.isUnmounting = true;
    }

    loadCollections() {
        this.setState({loading: true});

        this.s3Client.listBuckets((err, buckets) => {
            if (this.isUnmounting) {
                return;
            }

            if (err) {
                console.error("An error occurred while loading collections", err);
                this.setState({error: true, loading: false});
            } else {
                this.metadataStore
                    .getCollectionMetadata(buckets.Buckets.map(bucket => bucket.Name))
                    .then((collections) => {
                        if (this.isUnmounting) {
                            return;
                        }

                        this.setState({loading: false, collections: collections});
                    }).catch((e) => {
                    if (this.isUnmounting) {
                        return;
                    }

                    console.error("An error occurred while loading collection metadata", e);
                    this.setState({error: true, loading: false});
                });
            }
        });
    }

    generateId() {
        // TODO: Determine the best way to generate a new id
        return '' + (Math.random() * 10000000);
    }

    handleAddClick(e) {
        const collectionId = this.generateId();

        // Create the bucket in storage
        this.s3Client.createBucket({
            'Bucket': collectionId
        }, (err) => {
            if (err) {
                console.error("An error occurred while creating a collection", err);
            } else {
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
            }
        });
    }

    handleHomeClick(e) {
        this.setState({showDirectories: false})
    }

    handleCloseInfoDrawer(e) {
        this.closeDrawer();
    }

    handleCollectionClick(collection) {
        this.setState({infoDrawerOpened: true, selectedCollection: collection});
    }

    handleCollectionDoubleClick(collection) {
        this.setState({infoDrawerOpened: false, selectedCollection: collection, showDirectories: true});
    }

    handleCollectionDetailsChange(collectionId, parameters) {
        // Update information about the name and collection
        this.metadataStore.updateCollectionMetadata({
            id: collectionId,
            name: parameters.name,
            description: parameters.description
        }).then(() => {
            // Update the currently selected collection
            this.setState({selectedCollection: Object.assign({}, this.state.selectedCollection, parameters)});

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
        if (this.state.showDirectories) {
            return this.showDirectories()
        } else {
            return this.showCollections();
        }
    }

    showDirectories() {
        return (
            <div>
                <Button variant="fab" color="primary" aria-label="Home" onClick={this.handleHomeClick.bind(this)}>
                    <Icon>home</Icon>
                </Button>
                <DirectoryBrowser collection={this.state.selectedCollection} s3={this.s3Client}/>
            </div>);
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

                <InformationDrawer
                    open={this.state.infoDrawerOpened}
                    collection={this.state.selectedCollection}
                    onClose={this.handleCloseInfoDrawer.bind(this)}
                    onChangeDetails={this.handleCollectionDetailsChange.bind(this)}
                    metadata={this.state.metadata}
                    vocabulary={this.state.vocabulary}
                >
                </InformationDrawer>
            </div>
        );
    }
}

export default (CollectionBrowser);



