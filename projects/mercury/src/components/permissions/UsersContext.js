import React, {useEffect, useState} from 'react';
import WorkspaceAPI from "../../services/WorkspaceAPI";

const UsersContext = React.createContext({});

export const UsersProvider = ({children}) => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const refresh = () => {
        setLoading(true);
        WorkspaceAPI.getUsers()
            .then(setUsers)
            .catch(setError)
            .finally(() => {
                setLoading(false);
            });
    };

    // Refresh the permissions whenever the component is rerendered
    useEffect(refresh, []);

    return (
        <UsersContext.Provider
            value={{
                users,
                usersError: error,
                usersLoading: loading,
                refresh
            }}
        >
            {children}
        </UsersContext.Provider>
    );
};

export default UsersContext;
