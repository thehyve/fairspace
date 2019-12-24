import React from 'react';

import onLogout from "../services/logout";

const LogoutContext = React.createContext(() => {});

export const LogoutContextProvider = ({children, logoutUrl, jupyterhubUrl}) => (
    <LogoutContext.Provider value={() => onLogout({logoutUrl, jupyterhubUrl})}>
        {children}
    </LogoutContext.Provider>
);

export default LogoutContext;
