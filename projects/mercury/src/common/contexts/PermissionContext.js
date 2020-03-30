import React, {useContext, useEffect, useState} from 'react';
import {UsersContext} from "..";

import PermissionAPI from "../../permissions/PermissionAPI";
import {getDisplayName} from "../utils/userUtils";

const PermissionContext = React.createContext({});

export const PermissionProvider = ({iri, children, getPermissions = PermissionAPI.getPermissions}) => {
    const {users} = useContext(UsersContext);
    const [permissions, setPermissions] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const extendWithUsernamesAndEmails = rawPermissions => rawPermissions.map(permission => {
        const user = users.find(u => permission.user === u.iri);
        return {...permission, name: getDisplayName(user), email: user.email};
    });

    const refresh = () => {
        let didCancel = false;

        const fetchData = async () => {
            setLoading(true);

            try {
                const fetchedPermissions = await getPermissions(iri);
                if (!didCancel) {
                    setPermissions(fetchedPermissions);
                    setLoading(false);
                }
            } catch (e) {
                if (!didCancel) {
                    setError(e);
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {didCancel = true;};
    };

    // Refresh the permissions whenever the iri changes
    useEffect(refresh, [iri]);

    return (
        <PermissionContext.Provider
            value={{
                permissions: extendWithUsernamesAndEmails(permissions),
                error,
                loading,
                refresh
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};

export default PermissionContext;
