import React from 'react';

export const UserContext = React.createContext({
    currentUser: {},
    currentUserLoading: false,
    currentUserError: null,
});
