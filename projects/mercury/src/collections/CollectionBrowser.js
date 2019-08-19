import React from 'react';
import Button from "@material-ui/core/Button";

import {ErrorDialog, MessageDisplay, LoadingInlay, LoadingOverlay} from "../common/components";
import CollectionEditor from './CollectionEditor';
import CollectionList from "./CollectionList";
import {findById} from "../common/utils/genericUtils";
import {getCollectionAbsolutePath} from '../common/utils/collectionUtils';
import Config from "../common/services/Config/Config";
import {getLocalPart} from "../common/utils/linkeddata/metadataUtils";

export class CollectionBrowser extends React.Component {
    state = {
        addingNewCollection: false
    };

    componentDidMount() {
        this.props.fetchCollectionsIfNeeded();
    }

    handleAddCollectionClick = () => {
        this.setState({addingNewCollection: true});
    }

    handleCollectionClick = (collection) => {
        const {selectedCollectionLocation, selectCollection} = this.props;
        if (selectedCollectionLocation !== collection.location) {
            selectCollection(collection.location);
        }
    }

    handleCollectionDoubleClick = (collection) => {
        this.props.history.push(getCollectionAbsolutePath(collection.location));
    }

    handleAddCollection = (name, description, location, connectionString) => {
        this.props.addCollection(name, description, connectionString, location)
            .then(this.props.fetchCollectionsIfNeeded)
            .then(() => this.setState({addingNewCollection: false}))
            .catch(err => {
                const message = err && err.message ? err.message : "An error occurred while creating a collection";
                ErrorDialog.showError(err, message);
            });
    }

    handleCancelAddCollection = () => {
        this.setState({addingNewCollection: false});
    }

    renderCollectionList() {
        const {collections, addingCollection, deletingCollection, users} = this.props;

        collections.forEach(col => {
            col.creatorObj = findById(users, getLocalPart(col.createdBy));
        });

        return (
            <>
                <CollectionList
                    collections={this.props.collections}
                    selectedCollectionLocation={this.props.selectedCollectionLocation}
                    onCollectionClick={this.handleCollectionClick}
                    onCollectionDoubleClick={this.handleCollectionDoubleClick}
                />
                {this.state.addingNewCollection ? (
                    <CollectionEditor
                        title="Add collection"
                        onSave={this.handleAddCollection}
                        onClose={this.handleCancelAddCollection}
                        editType={Config.get().enableExperimentalFeatures}
                    />
                ) : null}
                <LoadingOverlay loading={addingCollection || deletingCollection} />
            </>
        );
    }

    render() {
        const {loading, error, currentUserError, currentUserLoading, usersLoading, usersError} = this.props;

        if (error || usersError || currentUserError) {
            return <MessageDisplay message="An error occurred while loading collections" />;
        }

        return (
            <>
                {loading || usersLoading || currentUserLoading ? <LoadingInlay /> : this.renderCollectionList()}
                <Button
                    style={{marginTop: 8}}
                    color="primary"
                    variant="contained"
                    aria-label="Add"
                    title="Create a new collection"
                    onClick={this.handleAddCollectionClick}
                >
                    New
                </Button>
            </>
        );
    }
}

CollectionBrowser.defaultProps = {
    fetchCollectionsIfNeeded: () => {},
    collections: []
};

export default CollectionBrowser;
