import React, {useEffect, useState} from 'react';

import onLogout from "../services/logout";
import {getUser} from '../services/UsersAndWorkspaceAPI';

const UserContext = React.createContext({});

export const UserProvider = ({children, url}) => {
    const [currentUser, setCurrentUser] = useState({});
    const [currentUserLoading, setCurrentUserLoading] = useState(false);
    const [currentUserError, setCurrentUserError] = useState(null);

    useEffect(() => {
        setCurrentUserLoading(true);

        getUser(url)
            .then(user => {
                setCurrentUser(user);
                setCurrentUserError(null);
            })
            .catch(setCurrentUserError)
            .finally(() => {
                setCurrentUserLoading(false);
            });
    }, [url]);

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
