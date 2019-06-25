import React, {useContext, useEffect, useState} from 'react';
import PermissionAPI from "../../services/PermissionAPI";
import getDisplayName from "../../utils/userUtils";
import UsersContext from "./UsersContext";

const PermissionContext = React.createContext({});

export const PermissionProvider = ({iri, children}) => {
    const {users} = useContext(UsersContext);
    const [permissions, setPermissions] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const extendWithUsernames = rawPermissions => rawPermissions.map(permission => ({...permission, userName: getDisplayName(users.find(user => permission.user === user.iri))}));

    const refresh = () => {
        setLoading(true);
        PermissionAPI.getPermissions(iri, false)
            .then(extendWithUsernames)
            .then(setPermissions)
            .catch(setError)
            .finally(() => {
                setLoading(false);
            });
    };

    // Refresh the permissions whenever the iri changes
    useEffect(refresh, [iri]);

    return (
        <PermissionContext.Provider
            value={{
                permissions,
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
