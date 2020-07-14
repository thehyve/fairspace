import React, {useContext, useState} from 'react';

import PermissionAPI from "./PermissionAPI";
import WorkspaceContext from "../workspaces/WorkspaceContext";
import useAsync from "../common/hooks/UseAsync";
import UsersContext from "../users/UsersContext";

const SharingContext = React.createContext({});

export const SharingProvider = ({iri, children, getPermissions = PermissionAPI.getPermissions}) => {
    const {workspaces, refreshWorkspaces} = useContext(WorkspaceContext);
    const {users, refreshUsers} = useContext(UsersContext);
    const [altering, setAltering] = useState(false);

    const extendWithWorkspaceNames = rawPermissions => rawPermissions
        .filter(permission => workspaces.find(ws => permission.user === ws.iri))
        .map(permission => ({...permission, name: workspaces.find(ws => permission.user === ws.iri).name}));

    const extendWithUserNames = rawPermissions => rawPermissions
        .filter(permission => users.find(ws => permission.user === ws.iri))
        .map(permission => ({...permission, name: users.find(ws => permission.user === ws.iri).name}));

    const {data: permissions = [], loading, error, refresh: refreshPermissions} = useAsync(() => getPermissions(iri), [iri]);

    const alterPermission = (userIri, resourceIri, access) => {
        setAltering(true);
        return PermissionAPI
            .alterPermission(userIri, resourceIri, access)
            .then(() => {
                refreshWorkspaces();
                refreshUsers();
                refreshPermissions();
            })
            .catch(e => {console.error("Error altering permission", e);})
            .finally(() => setAltering(false));
    };

    return (
        <SharingContext.Provider
            value={{
                workspacesWithShare: extendWithWorkspaceNames(permissions),
                usersWithShare: extendWithUserNames(permissions),
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
