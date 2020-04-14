import React, {useContext, useEffect, useState} from 'react';

import PermissionAPI from "../../permissions/PermissionAPI";
import WorkspaceContext from "../../workspaces/WorkspaceContext";

const SharingContext = React.createContext({});

export const SharingProvider = ({iri, children, getPermissions = PermissionAPI.getPermissions}) => {
    const {workspaces, refreshWorkspaces} = useContext(WorkspaceContext);
    const [permissions, setPermissions] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [altering, setAltering] = useState(false);

    const extendWithNames = rawPermissions => rawPermissions.map(permission => ({...permission, name: workspaces.find(ws => permission.user === ws.iri).name}));

    const refreshPermissions = () => {
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
    useEffect(refreshPermissions, [iri]);

    const alterPermission = (userIri, resourceIri, access) => {
        setAltering(true);
        return PermissionAPI
            .alterPermission(userIri, resourceIri, access)
            .then(() => {
                refreshWorkspaces();
                refreshPermissions();
            })
            .catch(e => {console.error("Error altering permission", e);})
            .finally(() => setAltering(false));
    };

    return (
        <SharingContext.Provider
            value={{
                permissions: extendWithNames(permissions),
                error,
                loading,
                alterPermission,
                altering
            }}
        >
            {children}
        </SharingContext.Provider>
    );
};

export default SharingContext;
