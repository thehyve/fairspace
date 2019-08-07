import {useEffect, useState} from "react";

import WorkspaceAPI from "../services/WorkspaceAPI";

const useWorkspaceInfo = () => {
    const [info, setInfo] = useState({});
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

    return {...info, loading, redirecting};
};

export default useWorkspaceInfo;
