import React, {useContext} from "react";
import CollaboratorsViewer from "./CollaboratorsViewer";
import UserContext from "../users/UserContext";
import CollectionsContext from "../collections/CollectionsContext";

export default ({collection, usersWithCollectionAccess, workspaceWithCollectionAccess, workspaceUsers, workspaces}) => {
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {setPermission, loading, error} = useContext(CollectionsContext);

    return (
        <CollaboratorsViewer
            loading={currentUserLoading || loading}
            error={currentUserError || error}
            setPermission={setPermission}
            currentUser={currentUser}
            workspaceUsers={workspaceUsers}
            usersWithCollectionAccess={usersWithCollectionAccess}
            workspaceWithCollectionAccess={workspaceWithCollectionAccess}
            collection={collection}
            workspaces={workspaces}
        />
    );
};
