import React, {useState, useEffect} from 'react';

import WorkspaceAPI from "./services/WorkspaceAPI";

const initialState = {
    name: 'Fairspace',
    version: ''
};

const WorkspaceContext = React.createContext(initialState);

export const WorkspaceProvider = ({children}) => {
    const [info, setInfo] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        setLoading(true);
        WorkspaceAPI.getWorkspace()
            .then(i => {
                setInfo(i);
                setLoading(false);
            })
            .catch((error) => {
                setRedirecting(!!error.redirecting);
            });
    }, []);

    return (
        <WorkspaceContext.Provider
            value={{
                ...info,
                loading,
                redirecting,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
};

export default WorkspaceContext;
