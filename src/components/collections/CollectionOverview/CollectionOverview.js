import React from 'react';
import CollectionList from "../CollectionList/CollectionList";

class CollectionOverview extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.collectionStore = props.collectionStore;
        this.metadataStore = props.metadataStore;

        // Initialize state
        this.state = {
            loading: false,
            collections: [],
            selectedCollection: props.selectedCollection
        };
    }

    componentDidMount() {
        this.loadContents();
    }

    componentWillUnmount() {
        this.isUnmounting = true;
    }

    loadContents() {
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


                        // Update the state and send out events
                        this.setState({loading: false, collections: mergedCollections});
                        if(this.onCollectionsDidLoad) {
                            this.onCollectionsDidLoad(mergedCollections);
                        }

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

    componentWillReceiveProps(nextProps) {
        if(nextProps.refreshCollections) {
            this.loadContents();
        }

        this.setState({
            selectedCollection: nextProps.selectedCollection
        });
    }

    render() {
        if(this.state.loading) {
            return (<div>Loading...</div>);
        }

        return (
            <CollectionList collections={this.state.collections}
                            selectedCollection={this.state.selectedCollection}
                            onCollectionClick={this.props.onCollectionClick}
                            onCollectionDoubleClick={this.props.onCollectionDoubleClick}
            />);
    }
}

export default CollectionOverview;
