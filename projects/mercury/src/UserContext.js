import React, {useState, useEffect} from 'react';

import onLogout from "./services/logout";
import AccountAPI from './services/AccountAPI';

const UserContext = React.createContext({});

export const UserProvider = ({children}) => {
    const [currentUserLoading, setCurrentUserLoading] = useState(false);
    const [currentUserError, setCurrentUserError] = useState(null);
    const [currentUser, setCurrentUser] = useState({});

    useEffect(() => {
        setCurrentUserLoading(true);
        AccountAPI.getUser()
            .then(user => {
                setCurrentUser(user);
                setCurrentUserLoading(false);
                setCurrentUserError(false);
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
                onLogout
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
