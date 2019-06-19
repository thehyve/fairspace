import React, {useEffect, useState} from 'react';
import PermissionAPI from "../../services/PermissionAPI";

const PermissionContext = React.createContext({});

export const PermissionProvider = ({iri, children}) => {
    const [permissions, setPermissions] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const updatePermissions = () => {
        setLoading(true);
        PermissionAPI.getPermissions(iri, false)
            .then(setPermissions)
            .catch(setError)
            .finally(() => {
                setLoading(false);
            });
    };

    // Refresh the permissions whenever the iri changes
    useEffect(updatePermissions, [iri]);

    return (
        <PermissionContext.Provider
            value={{
                permissions,
                error,
                loading,
                updatePermissions
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};

export default PermissionContext;
