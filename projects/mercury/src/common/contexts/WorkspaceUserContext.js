import React, {useEffect, useState} from 'react';

import {getWorkspaceUser} from '../../users/UsersAPI';

const WorkspaceUserContext = React.createContext({});

export const WorkspaceUserProvider = ({children}) => {
    const [workspaceUser, setWorkspaceUser] = useState({});
    const [workspaceUserLoading, setWorkspaceUserLoading] = useState(false);
    const [workspaceUserError, setWorkspaceUserError] = useState(null);

    const refreshWorkspaceUser = () => {
        setWorkspaceUserLoading(true);

        getWorkspaceUser()
            .then(user => {
                setWorkspaceUser(user);
                setWorkspaceUserError(null);
            })
            .catch(setWorkspaceUserError)
            .finally(() => {
                setWorkspaceUserLoading(false);
            });
    };

    useEffect(refreshWorkspaceUser, []);

    return (
        <WorkspaceUserContext.Provider
            value={{
                workspaceUser,
                workspaceUserLoading,
                workspaceUserError,
                refreshWorkspaceUser
            }}
        >
            {children}
        </WorkspaceUserContext.Provider>
    );
};

export default WorkspaceUserContext;
