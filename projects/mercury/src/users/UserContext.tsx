// @ts-nocheck
// @ts-nocheck
import React, { useEffect, useState } from "react";
import onLogout from "../routes/logout";
import { getUser } from "./UsersAPI";
const UserContext = React.createContext({});
export const UserProvider = ({
  children
}) => {
  const [currentUser, setCurrentUser] = useState({
    authorizations: []
  });
  const [currentUserLoading, setCurrentUserLoading] = useState(false);
  const [currentUserError, setCurrentUserError] = useState(null);

  const refreshUser = () => {
    setCurrentUserLoading(true);
    getUser().then(user => {
      setCurrentUser(user);
      setCurrentUserError(null);
    }).catch(setCurrentUserError).finally(() => {
      setCurrentUserLoading(false);
    });
  };

  useEffect(refreshUser, []);
  return <UserContext.Provider value={{
    currentUser,
    currentUserLoading,
    currentUserError,
    refreshUser,
    onLogout: () => onLogout({})
  }}>
            {children}
        </UserContext.Provider>;
};
export default UserContext;