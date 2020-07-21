import React, {useContext} from "react";
import PermissionsViewer from "./PermissionsViewer";
import UserContext from "../users/UserContext";
import CollectionsContext from "../collections/CollectionsContext";

export default ({collection, usersWithCollectionAccess, workspaceUsers}) => {
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {setPermission, loading, error} = useContext(CollectionsContext);

    return (
        <PermissionsViewer
            loading={currentUserLoading || loading}
            error={currentUserError || error}
            setPermission={setPermission}
            currentUser={currentUser}
            workspaceUsers={workspaceUsers}
            usersWithCollectionAccess={usersWithCollectionAccess}
            collection={collection}
        />
    );
};
