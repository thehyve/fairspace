import React, {useState, useEffect} from 'react';

import onLogout from "./services/logout";
import AccountAPI from './services/AccountAPI';
import WorkspaceAPI from "./services/WorkspaceAPI";

const UserContext = React.createContext({});

export const UserProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState({
        loading: false,
        error: null,
        user: {}
    });

    const [users, setUsers] = useState({
        loading: false,
        error: null,
        users: {}
    });

    const refreshUsers = () => {
        setUsers({
            ...users,
            loading: true
        });

        WorkspaceAPI.getUsers()
            .then(u => {
                setUsers({
                    loading: false,
                    error: null,
                    users: u
                });
            })
            .catch(e => setUsers({
                ...users,
                error: e
            }))
            .finally(() => {
                setUsers({
                    ...users,
                    loading: false
                });
            });
    };

    // Refresh the permissions whenever the component is rerendered
    useEffect(refreshUsers, []);

    useEffect(() => {
        setCurrentUser({
            ...currentUser,
            loading: true
        });

        AccountAPI.getUser()
            .then(user => {
                setCurrentUser({
                    loading: false,
                    error: null,
                    user
                });
            })
            .catch(e => setCurrentUser({
                ...currentUser,
                error: e
            }))
            .finally(() => {
                setCurrentUser({
                    ...currentUser,
                    loading: false
                });
            });
    }, [currentUser]);

    return (
        <UserContext.Provider
            value={{
                currentUser: currentUser.user,
                currentUserLoading: currentUser.loading,
                currentUserError: currentUser.error,
                onLogout,
                users: users.users,
                usersError: users.error,
                usersLoading: users.loading,
                refreshUsers
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
