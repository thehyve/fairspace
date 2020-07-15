import React, {useContext} from "react";

import AlterPermissionDialog from "./AlterPermissionDialog";
import PermissionContext from "./PermissionContext";
import WorkspaceUsersContext from "../workspaces/WorkspaceUsersContext";
import MessageDisplay from "../common/components/MessageDisplay";
import LoadingInlay from "../common/components/LoadingInlay";

const AlterPermissionContainer = props => {
    const {permissions, loading: loadingPermissions, error: errorPermissions} = useContext(PermissionContext);
    const {workspaceUsers, workspaceUsersError, workspaceUsersLoading} = useContext(WorkspaceUsersContext);

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
            users={workspaceUsers}
            loading={loadingPermissions}
            error={errorPermissions}
        />
    );
};


export default AlterPermissionContainer;
