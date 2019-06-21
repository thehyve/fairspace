import React, {useState, useEffect} from 'react';

import onLogout from "./services/logout";
import AccountAPI from './services/AccountAPI';
import WorkspaceAPI from "./services/WorkspaceAPI";

const UserContext = React.createContext({});

export const UserProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState({});
    const [currentUserLoading, setCurrentUserLoading] = useState(false);
    const [currentUserError, setCurrentUserError] = useState(null);

    const [users, setUsers] = useState([]);
    const [usersError, setError] = useState(false);
    const [usersLoading, setLoading] = useState(false);

    const refreshUsers = () => {
        setLoading(true);
        WorkspaceAPI.getUsers()
            .then(setUsers)
            .catch(setError)
            .finally(() => {
                setLoading(false);
            });
    };

    // Refresh the permissions whenever the component is rerendered
    useEffect(refreshUsers, []);

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
                onLogout,
                users,
                usersError,
                usersLoading,
                refreshUsers
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
