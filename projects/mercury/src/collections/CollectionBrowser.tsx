// @ts-nocheck
import React, {useContext, useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import Button from "@mui/material/Button";
import CollectionEditor from "./CollectionEditor";
import CollectionList from "./CollectionList";
import CollectionsContext from "./CollectionsContext";
import WorkspaceContext from "../workspaces/WorkspaceContext";
import UserContext from "../users/UserContext";
import UsersContext from "../users/UsersContext";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import {getDisplayName} from "../users/userUtils";
import type {User} from "../users/UsersAPI";
import type {Collection} from "./CollectionAPI";
import {getCollectionAbsolutePath} from "./collectionUtils";
import type {Workspace} from "../workspaces/WorkspacesAPI";
type ContextualCollectionBrowserProperties = {
  history: History;
  workspaceIri: string;
  isSelected: (arg0: any) => boolean;
  toggleCollection: (arg0: any) => void;
  setBusy: () => void;
};
type CollectionBrowserProperties = ContextualCollectionBrowserProperties & {
  loading: boolean;
  error: Error;
  collections: Collection[];
  users: User[];
  workspace: Workspace;
  showDeleted: boolean;
  canAddCollection: boolean;
};
export const CollectionBrowser = (props: CollectionBrowserProperties) => {
    const {
        loading = false,
        collections = [],
        isSelected = () => false,
        toggleCollection = () => {},
        users = [],
        canAddCollection = true,
        setBusy = () => {},
        showDeleted,
        history,
        error,
        workspace
    } = props;
    const [addingNewCollection, setAddingNewCollection] = useState(false);

    const handleAddCollectionClick = () => setAddingNewCollection(true);

    const handleCollectionClick = collection => {
        toggleCollection(collection);
    };

    const handleCollectionDoubleClick = collection => {
        history.push(encodeURI(getCollectionAbsolutePath(collection.name)));
    };

    const handleCancelAddCollection = () => setAddingNewCollection(false);

    const renderCollectionList = () => {
        collections.forEach(collection => {
            collection.creatorDisplayName = getDisplayName(users.find(u => u.iri === collection.createdBy));
        });
        return <>
            <CollectionList collections={collections} isSelected={isSelected} onCollectionClick={handleCollectionClick} onCollectionDoubleClick={handleCollectionDoubleClick} showDeleted={showDeleted} />
            {addingNewCollection ? <CollectionEditor setBusy={setBusy} onClose={handleCancelAddCollection} workspace={workspace} /> : null}
        </>;
    };

    if (error) {
        return <MessageDisplay message="An error occurred while loading collections" />;
    }

    return <>
        {loading ? <LoadingInlay /> : renderCollectionList()}
        {canAddCollection && <Button style={{
            marginTop: 8
        }} color="primary" variant="contained" aria-label="Add" title="Create a new collection" onClick={handleAddCollectionClick}>
                    New
        </Button>}
    </>;
};

const ContextualCollectionBrowser = (props: ContextualCollectionBrowserProperties) => {
    const {
        currentUserError,
        currentUserLoading
    } = useContext(UserContext);
    const {
        users,
        usersLoading,
        usersError
    } = useContext(UsersContext);
    const {
        collections,
        collectionsLoading,
        collectionsError,
        showDeleted,
        setShowDeleted
    } = useContext(CollectionsContext);
    const {
        workspacesLoading,
        workspacesError,
        workspaces
    } = useContext(WorkspaceContext);
    const workspace = props.workspaceIri ? workspaces.find(w => w.iri === props.workspaceIri) : {};
    const {
        showDeletedCollections
    } = props;
    const canAdd = window.location.pathname === '/workspace' && workspace.canCollaborate;
    const filteredCollections = props.workspaceIri ? collections.filter(c => c.ownerWorkspace === props.workspaceIri) : collections;
    useEffect(() => setShowDeleted(showDeletedCollections), [setShowDeleted, showDeletedCollections]);
    return <CollectionBrowser {...props} workspace={workspace} collections={filteredCollections} users={users} canAddCollection={canAdd} showDeleted={showDeleted} loading={collectionsLoading || currentUserLoading || usersLoading || workspacesLoading} error={collectionsError || currentUserError || usersError || workspacesError} />;
};

export default withRouter(ContextualCollectionBrowser);