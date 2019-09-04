import React, {useState, useEffect} from 'react';

import WorkspaceAPI from "../services/WorkspaceAPI";

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
        WorkspaceAPI.getVersion()
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
