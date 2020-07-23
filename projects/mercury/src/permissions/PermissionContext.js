import React, {useContext, useState} from 'react';

import PermissionAPI from "./PermissionAPI";
import {getDisplayName, getEmail} from "../users/userUtils";
import useAsync from "../common/hooks/UseAsync";
import UsersContext from "../users/UsersContext";

// Deprecated and broken
const PermissionContext = React.createContext({});

export const PermissionProvider = ({iri, children, getPermissions = PermissionAPI.getPermissions}) => {
    const {users, refresh: refreshUsers} = useContext(UsersContext);
    const [altering, setAltering] = useState(false);

    const getUsersPermissions = rawPermissions => {
        const userPermissions = [];
        rawPermissions.forEach(permission => {
            const user = users.find(u => permission.user === u.iri);
            if (user) {
                userPermissions.push({...permission, name: getDisplayName(user), email: getEmail(user)});
            }
        });
        return userPermissions;
    };

    const {data: permissions = [], loading, error, refresh: refreshPermissions} = useAsync(() => getPermissions(iri), [iri]);

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
        <PermissionContext.Provider
            value={{
                permissions: getUsersPermissions(permissions),
                error,
                loading,
                alterPermission,
                altering
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};

export default PermissionContext;
