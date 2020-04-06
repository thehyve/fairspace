import React, {useContext, useState} from 'react';
import {withRouter} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {LoadingInlay, MessageDisplay, UserContext, UsersContext} from '../common';
import CollectionEditor from './CollectionEditor';
import CollectionList from "./CollectionList";
import {getCollectionAbsolutePath} from '../common/utils/collectionUtils';
import CollectionsContext from "../common/contexts/CollectionsContext";

export const CollectionBrowser = ({
    loading = false,
    error = false,
    collections = [],
    isSelected = () => false,
    toggleCollection = () => {},
    users = [],
    history,
    workspaceIri
}) => {
    const [addingNewCollection, setAddingNewCollection] = useState(false);

    const handleAddCollectionClick = () => setAddingNewCollection(true);

    const handleCollectionClick = (collection) => {
        toggleCollection(collection);
    };

    const handleCollectionDoubleClick = (collection) => {
        history.push(getCollectionAbsolutePath(collection.location));
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
                        onClose={handleCancelAddCollection}
                        workspaceIri={workspaceIri}
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
            {
                window.location.pathname.startsWith('/workspaces/')
                && (
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
                )
            }
        </>
    );
};

const ContextualCollectionBrowser = (props) => {
    const {currentUserError, currentUserLoading} = useContext(UserContext);
    const {users, usersLoading, usersError} = useContext(UsersContext);
    const {collections, collectionsLoading, collectionsError} = useContext(CollectionsContext);

    const filteredCollections = props.workspaceIri
        ? collections.filter(c => c.ownerWorkspace === props.workspaceIri)
        : collections;

    return (
        <CollectionBrowser
            {...props}
            collections={filteredCollections}
            users={users}
            loading={collectionsLoading || currentUserLoading || usersLoading}
            error={collectionsError || currentUserError || usersError}
        />
    );
};

export default withRouter(ContextualCollectionBrowser);
