import React, {useContext} from 'react';
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import UserPermissionsList from "./UserPermissionsList";
import UserContext from "../users/UserContext";
import CollectionsContext from "../collections/CollectionsContext";
import WorkspacePermissionsList from "./WorkspacePermissionsList";
import {sortPermissions} from "../collections/collectionUtils";

export const PermissionViewer = ({collection, workspaceUsers, collaboratingWorkspaces,
    collaboratingUsers, currentUser, setPermission, error, loading}) => {
    if (error) {
        return (<MessageDisplay message="An error occurred loading permissions" />);
    }
    if (loading) {
        return (<LoadingInlay />);
    }

    const renderUserPermissionList = () => (
        <UserPermissionsList
            permissions={sortPermissions(collaboratingUsers)}
            collection={collection}
            setPermission={setPermission}
            currentUser={currentUser}
            workspaceUsers={workspaceUsers}
        />
    );

    const renderWorkspacePermissionList = () => (
        <WorkspacePermissionsList
            permissions={sortPermissions(collaboratingWorkspaces)}
            setPermission={setPermission}
            collection={collection}
        />
    );

    return (
        <div>
            {renderUserPermissionList()}
            {renderWorkspacePermissionList()}
        </div>
    );
};

PermissionViewer.defaultProps = {};

const ContextualPermissionViewer = ({collection, workspaceUsers, collaboratingUsers, collaboratingWorkspaces}) => {
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {setPermission, loading, error} = useContext(CollectionsContext);

    return (
        <PermissionViewer
            loading={currentUserLoading || loading}
            error={currentUserError || error}
            setPermission={setPermission}
            currentUser={currentUser}
            collaboratingUsers={collaboratingUsers}
            collaboratingWorkspaces={collaboratingWorkspaces}
            collection={collection}
            workspaceUsers={workspaceUsers}
        />
    );
};

export default ContextualPermissionViewer;
