import React, {useEffect, useState} from 'react';

import onLogout from "../services/logout";
import {getUser} from '../services/UsersAndWorkspaceAPI';

const UserContext = React.createContext({});

export const UserProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState({});
    const [currentUserLoading, setCurrentUserLoading] = useState(false);
    const [currentUserError, setCurrentUserError] = useState(null);

    useEffect(() => {
        setCurrentUserLoading(true);

        getUser()
            .then(user => {
                setCurrentUser(user);
                setCurrentUserError(null);
            })
            .catch(setCurrentUserError)
            .finally(() => {
                setCurrentUserLoading(false);
            });
    }, []);

    return (
        <UserContext.Provider
            value={{
                currentUser,
                currentUserLoading,
                currentUserError,
                onLogout: () => onLogout({})
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
