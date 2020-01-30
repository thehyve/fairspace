import React, {useEffect, useState} from 'react';

import {getProjectUser} from '../../users/UsersAPI';

const ProjectUserContext = React.createContext({});

export const ProjectUserProvider = ({children}) => {
    const [projectUser, setProjectUser] = useState({});
    const [projectUserLoading, setProjectUserLoading] = useState(false);
    const [projectUserError, setProjectUserError] = useState(null);

    const refreshProjectUser = () => {
        setProjectUserLoading(true);

        getProjectUser()
            .then(user => {
                setProjectUser(user);
                setProjectUserError(null);
            })
            .catch(setProjectUserError)
            .finally(() => {
                setProjectUserLoading(false);
            });
    };

    useEffect(refreshProjectUser, []);

    return (
        <ProjectUserContext.Provider
            value={{
                projectUser,
                projectUserLoading,
                projectUserError,
                refreshProjectUser
            }}
        >
            {children}
        </ProjectUserContext.Provider>
    );
};

export default ProjectUserContext;
