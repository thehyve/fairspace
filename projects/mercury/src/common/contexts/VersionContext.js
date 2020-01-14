import React, {useEffect, useState} from 'react';

import {getVersion} from "../../users/UsersAndWorkspaceAPI";

const initialState = {
    name: 'Fairspace',
    description: '',
    version: ''
};

const VersionContext = React.createContext(initialState);

export const VersionProvider = ({children}) => {
    const [info, setInfo] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        setLoading(true);
        getVersion()
            .then(i => {
                setInfo(i);
                setLoading(false);
            })
            .catch((error) => {
                setRedirecting(!!error.redirecting);
            });
    }, []);

    return (
        <VersionContext.Provider
            value={{
                ...info,
                loading,
                redirecting,
            }}
        >
            {children}
        </VersionContext.Provider>
    );
};

export default VersionContext;
