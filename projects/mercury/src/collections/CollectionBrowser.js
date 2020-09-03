import React, {useContext, useEffect, useState} from 'react';
import {withRouter} from "react-router-dom";
import Button from "@material-ui/core/Button";
import CollectionEditor from './CollectionEditor';
import CollectionList from "./CollectionList";
import {getCollectionAbsolutePath} from './collectionUtils';
import CollectionsContext from "./CollectionsContext";
import WorkspaceContext from "../workspaces/WorkspaceContext";
import UserContext from "../users/UserContext";
import UsersContext from "../users/UsersContext";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";

export const CollectionBrowser = ({
    loading = false,
    error = false,
    collections = [],
    isSelected = () => false,
    toggleCollection = () => {},
    users = [],
    history,
    workspaceIri,
    canAddCollection = true,
    showDeleted,
    setBusy = () => {}
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
                    showDeleted={showDeleted}
                />
                {addingNewCollection ? (
                    <CollectionEditor
                        setBusy={setBusy}
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
                canAddCollection
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
    const {collections, collectionsLoading, collectionsError, showDeleted, setShowDeleted} = useContext(CollectionsContext);
    const {workspacesLoading, workspacesError, workspaces} = useContext(WorkspaceContext);
    const workspace = props.workspaceIri ? workspaces.find(w => w.iri === props.workspaceIri) : {};
    const {showDeletedCollections} = props;

    const canAdd = window.location.pathname === '/workspace' && workspace.canCollaborate;

    const filteredCollections = props.workspaceIri
        ? collections.filter(c => c.ownerWorkspace === props.workspaceIri)
        : collections;

    useEffect(() => setShowDeleted(showDeletedCollections), [setShowDeleted, showDeletedCollections]);

    return (
        <CollectionBrowser
            {...props}
            collections={filteredCollections}
            users={users}
            canAddCollection={canAdd}
            showDeleted={showDeleted}
            loading={collectionsLoading || currentUserLoading || usersLoading || workspacesLoading}
            error={collectionsError || currentUserError || usersError || workspacesError}
        />
    );
};

export default withRouter(ContextualCollectionBrowser);
