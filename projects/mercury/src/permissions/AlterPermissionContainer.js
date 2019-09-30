import React, {useContext} from "react";
import {UsersContext} from '@fairspace/shared-frontend';

import AlterPermissionDialog from "./AlterPermissionDialog";
import PermissionContext from "../common/contexts/PermissionContext";

const AlterPermissionContainer = props => {
    const {permissions, loading: loadingPermissions, error: errorPermissions} = useContext(PermissionContext);
    const {users, loadingUsers, errorUsers} = useContext(UsersContext);

    return (
        <AlterPermissionDialog
            {...props}
            collaborators={permissions}
            users={users}
            loading={loadingPermissions || loadingUsers}
            error={errorPermissions || errorUsers}
        />
    );
};


export default AlterPermissionContainer;
