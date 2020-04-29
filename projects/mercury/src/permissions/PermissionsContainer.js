import React, {useContext} from "react";

import PermissionContext from "../common/contexts/PermissionContext";
import PermissionsViewer from "./PermissionsViewer";
import UserContext from "../users/UserContext";
import UsersContext from "../users/UsersContext";

export default ({iri, canManage}) => {
    const {permissions, loading: permissionsLoading, error: permissionsError, alterPermission, altering} = useContext(PermissionContext);
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {usersLoading, usersError} = useContext(UsersContext);


    return (
        <PermissionsViewer
            loading={permissionsLoading || currentUserLoading || usersLoading}
            error={permissionsError || currentUserError || usersError}
            altering={altering}
            permissions={permissions}
            alterPermission={alterPermission}
            currentUser={currentUser}
            iri={iri}
            canManage={canManage}
        />
    );
};
