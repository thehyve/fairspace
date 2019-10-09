import React, {useContext, useState} from "react";
import {UsersContext, UserContext} from '@fairspace/shared-frontend';

import PermissionContext from "../common/contexts/PermissionContext";
import PermissionAPI from "./PermissionAPI";
import PermissionsViewer from "./PermissionsViewer";
import {createMetadataIri} from "../common/utils/linkeddata/metadataUtils";

export default (props) => {
    const {permissions, loading: permissionsLoading, error: permissionsError, refresh: refreshPermissions} = useContext(PermissionContext);
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    const {usersLoading, usersError, refresh: refreshUsers} = useContext(UsersContext);
    const [altering, setAltering] = useState(false);

    const currentUserWithIri = {...currentUser, iri: createMetadataIri(currentUser.id)};

    const alterPermission = (userIri, resourceIri, access) => {
        setAltering(true);
        return PermissionAPI
            .alterPermission(userIri, resourceIri, access)
            .then(() => {
                refreshUsers();
                refreshPermissions();
            })
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
            currentUser={currentUserWithIri}
            {...props}
        />
    );
};
