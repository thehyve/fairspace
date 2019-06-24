import React, {useContext, useState} from "react";

import PermissionsViewer from "./PermissionsViewer";
import PermissionContext from "./PermissionContext";
import PermissionAPI from "../../services/PermissionAPI";
import UserContext from '../../UserContext';

export default (props) => {
    const {permissions, loading: permissionsLoading, error: permissionsError, refresh} = useContext(PermissionContext);
    const {currentUser, currentUserLoading, currentUserError, usersLoading, usersError} = useContext(UserContext);
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
