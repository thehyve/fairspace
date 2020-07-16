import React, {useContext} from "react";

import AlterPermissionDialog from "./AlterPermissionDialog";
import PermissionContext from "./PermissionContext";
import WorkspaceUsersContext from "../workspaces/WorkspaceUsersContext";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";
import UsersContext from "../users/UsersContext";
import {getWorkspaceUsersWithRoles} from "../users/userUtils";

const AlterPermissionContainer = props => {
    const {permissions, loading: loadingPermissions, error: errorPermissions} = useContext(PermissionContext);
    const {workspaceUsers, workspaceUsersError, workspaceUsersLoading} = useContext(WorkspaceUsersContext);
    const {users} = useContext(UsersContext);
    const workspaceUsersWithRoles = getWorkspaceUsersWithRoles(users, workspaceUsers);

    if (workspaceUsersError) {
        return (<MessageDisplay message="An error occurred while fetching workspace users." />);
    }
    if (workspaceUsersLoading) {
        return (<LoadingInlay />);
    }

    return (
        <AlterPermissionDialog
            {...props}
            collaborators={permissions}
            users={workspaceUsersWithRoles}
            loading={loadingPermissions}
            error={errorPermissions}
        />
    );
};


export default AlterPermissionContainer;
