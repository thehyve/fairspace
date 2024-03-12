import React from 'react';

import {getUsers} from './UsersAPI';
import useAsync from "../common/hooks/UseAsync";

const UsersContext = React.createContext({});

export const UsersProvider = ({children}) => {
    const {data, loading, error, refresh} = useAsync(getUsers);

    return (
        <UsersContext.Provider
            value={{
                users: data,
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
