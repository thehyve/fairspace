import React, {useState, useEffect, useContext} from 'react';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";

import {
    ErrorDialog, MessageDisplay,
    CollectionEditor,
    LoadingInlay, LoadingOverlay
} from "../common";
import CollectionList from "./CollectionList";
import * as collectionBrowserActions from "../../actions/collectionBrowserActions";
import * as collectionActions from "../../actions/collectionActions";
import {findById} from "../../utils/genericUtils";
import {getCollectionAbsolutePath} from '../../utils/collectionUtils';
import Config from "../../services/Config/Config";
import UserContext from '../../UserContext';

const CollectionBrowser = ({
    fetchCollectionsIfNeeded, users, collections, addingCollection, addCollection,
    deletingCollection, history, selectedCollectionLocation, selectCollection,
    error, loading
}) => {
    const [addingNewCollection, setAddingNewCollection] = useState(false);
    const {currentUserLoading, currentUserError} = useContext(UserContext);

    useEffect(() => {
        fetchCollectionsIfNeeded();
    }, [fetchCollectionsIfNeeded]);

    const handleAddCollectionClick = () => {
        setAddingNewCollection(true);
    };

    const handleCollectionClick = (collection) => {
        if (selectedCollectionLocation !== collection.location) {
            selectCollection(collection.location);
        }
    };

    const handleCollectionDoubleClick = (collection) => {
        history.push(getCollectionAbsolutePath(collection.location));
    };

    const handleAddCollection = (name, description, location, type) => {
        addCollection(name, description, type, location)
            .then(fetchCollectionsIfNeeded)
            .then(() => setAddingNewCollection(false))
            .catch(err => {
                const message = err && err.message ? err.message : "An error occurred while creating a collection";
                ErrorDialog.showError(err, message);
            });
    };

    const handleCancelAddCollection = () => {
        setAddingNewCollection(false);
    };

    const renderCollectionList = () => {
        collections.forEach(col => {
            col.creatorObj = findById(users, col.createdBy);
        });

        return (
            <>
                <CollectionList
                    collections={collections}
                    selectedCollectionLocation={selectedCollectionLocation}
                    onCollectionClick={handleCollectionClick}
                    onCollectionDoubleClick={handleCollectionDoubleClick}
                />
                {addingNewCollection ? (
                    <CollectionEditor
                        title="Add collection"
                        onSave={handleAddCollection}
                        onClose={handleCancelAddCollection}
                        editType={Config.get().enableExperimentalFeatures}
                    />
                ) : null}
                <LoadingOverlay loading={addingCollection || deletingCollection} />
            </>
        );
    };

    if (error || currentUserError) {
        return <MessageDisplay message="An error occurred while loading collections" />;
    }

    return (
        <>
            {(loading || currentUserLoading) ? <LoadingInlay /> : renderCollectionList()}
            <Button
                variant="text"
                aria-label="Add"
                title="Create a new collection"
                onClick={handleAddCollectionClick}
            >
                <Icon>add</Icon>
            </Button>
        </>
    );
};

const mapStateToProps = (state) => ({
    loading: state.cache.collections.pending || state.cache.users.pending,
    error: state.cache.collections.error || state.cache.users.error,
    collections: state.cache.collections.data,
    users: state.cache.users.data,
    selectedCollectionLocation: state.collectionBrowser.selectedCollectionLocation,
    addingCollection: state.collectionBrowser.addingCollection,
    deletingCollection: state.collectionBrowser.deletingCollection
});

const mapDispatchToProps = {
    ...collectionActions,
    ...collectionBrowserActions
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CollectionBrowser));
