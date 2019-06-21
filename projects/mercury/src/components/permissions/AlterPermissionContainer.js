import React, {useContext} from "react";
import AlterPermissionDialog from "./AlterPermissionDialog";
import PermissionContext from "./PermissionContext";
import UserContext from "../../UserContext";

const AlterPermissionContainer = props => {
    const {permissions, loading: loadingPermissions, error: errorPermissions} = useContext(PermissionContext);
    const {users, loadingUsers, errorUsers} = useContext(UserContext);

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
