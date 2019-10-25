import React, {useContext, useState} from 'react';
import {withRouter} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {ErrorDialog, LoadingInlay, MessageDisplay, UserContext, UsersContext} from '@fairspace/shared-frontend';
import CollectionEditor from './CollectionEditor';
import CollectionList from "./CollectionList";
import {getCollectionAbsolutePath} from '../common/utils/collectionUtils';
import Config from "../common/services/Config";
import CollectionsContext from "../common/contexts/CollectionsContext";

export const CollectionBrowser = ({
    loading = false,
    error = false,
    collections = [],
    isSelected = () => false,
    selectCollection = () => {},
    addCollection = () => {},
    users = [],
    history
}) => {
    const [addingNewCollection, setAddingNewCollection] = useState(false);

    const handleAddCollectionClick = () => setAddingNewCollection(true);

    const handleCollectionClick = (collection) => {
        if (!isSelected(collection)) {
            selectCollection(collection);
        }
    };

    const handleCollectionDoubleClick = (collection) => {
        history.push(getCollectionAbsolutePath(collection.location));
    };

    const handleAddCollection = (name, description, location, connectionString) => {
        addCollection(name, description, connectionString, location)
            .then(() => setAddingNewCollection(false))
            .catch(err => {
                const message = err && err.message ? err.message : "An error occurred while creating a collection";
                ErrorDialog.showError(err, message);
            });
    };

    const handleCancelAddCollection = () => setAddingNewCollection(false);

    const renderCollectionList = () => {
        collections.forEach(col => {
            col.creatorObj = users.find(u => u.iri === col.createdBy);
        });

        return (
            <>
                <CollectionList
                    collections={collections}
                    isSelected={isSelected}
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
            </>
        );
    };

    if (error) {
        return <MessageDisplay message="An error occurred while loading collections" />;
    }

    return (
        <>
            {loading ? <LoadingInlay /> : renderCollectionList()}
            <Button
                style={{marginTop: 8}}
                color="primary"
                variant="contained"
                aria-label="Add"
                title="Create a new collection"
                onClick={handleAddCollectionClick}
            >
                New
            </Button>
        </>
    );
};

const ContextualCollectionBrowser = (props) => {
    const {currentUserError, currentUserLoading} = useContext(UserContext);
    const {users, usersLoading, usersError} = useContext(UsersContext);
    const {collections, collectionsLoading, collectionsError, addCollection} = useContext(CollectionsContext);

    return (
        <CollectionBrowser
            {...props}
            collections={collections}
            addCollection={addCollection}
            users={users}
            loading={collectionsLoading || currentUserLoading || usersLoading}
            error={collectionsError || currentUserError || usersError}
        />
    );
};

export default withRouter(ContextualCollectionBrowser);
