import React from 'react';

import onLogout from "../services/logout";

const LogoutContext = React.createContext(() => {});

export const LogoutContextProvider = ({children}) => (
    <LogoutContext.Provider value={() => onLogout()}>
        {children}
    </LogoutContext.Provider>
);

export default LogoutContext;
