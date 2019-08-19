import React, {useContext, useState} from "react";

import PermissionContext from "../common/contexts/PermissionContext";
import UserContext from '../common/contexts/UserContext';
import UsersContext from '../common/contexts/UsersContext';
import PermissionAPI from "./PermissionAPI";
import PermissionsViewer from "./PermissionsViewer";

export default (props) => {
    const {permissions, loading: permissionsLoading, error: permissionsError, refresh} = useContext(PermissionContext);
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {usersLoading, usersError} = useContext(UsersContext);
    const [altering, setAltering] = useState(false);

    const alterPermission = (userIri, resourceIri, access) => {
        setAltering(true);
        return PermissionAPI
            .alterPermission(userIri, resourceIri, access)
            .then(refresh)
            .catch(e => {console.error("Error altering permission", e);})
            .finally(() => setAltering(false));
    };

    return (
        <PermissionsViewer
            loading={permissionsLoading || currentUserLoading || usersLoading}
            error={permissionsError || currentUserError || usersError}
            altering={altering}
            permissions={permissions}
            alterPermission={alterPermission}
            currentUser={currentUser}
            {...props}
        />
    );
};
