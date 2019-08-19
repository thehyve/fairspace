import React, {useState, useEffect} from 'react';

import onLogout from "../services/logout";
import AccountAPI from '../services/AccountAPI';

const UserContext = React.createContext({});

export const UserProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState({});
    const [currentUserLoading, setCurrentUserLoading] = useState(false);
    const [currentUserError, setCurrentUserError] = useState(null);

    useEffect(() => {
        setCurrentUserLoading(true);

        AccountAPI.getUser()
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
                onLogout
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
