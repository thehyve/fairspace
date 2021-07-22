import React, {useEffect, useState} from 'react';
import useInterval from "../common/hooks/UseInterval";
import {getServerStatus, getSessionStatus, SERVER_STATUS_DOWN, SERVER_STATUS_UP} from "./StatusAPI";
import type {StatusResponse} from "./StatusAPI";

const SESSION_STATUS_CHECK_DELAY = 5000;
const SERVER_STATUS_CHECK_DELAY = 5000;

export const VALID_USER_SESSION = "OK";

const StatusContext = React.createContext({});

export const StatusProvider = ({children}) => {
    const [serverStatus, setServerStatus] = useState(SERVER_STATUS_UP);
    const [userSessionStatus, setUserSessionStatus] = useState();

    const handleGetStatus = async () => getServerStatus()
        .then((response: StatusResponse) => {
            if (response.status) {
                setServerStatus(response.status);
            } else {
                setServerStatus(SERVER_STATUS_DOWN);
            }
        })
        .catch(() => {
            setServerStatus(SERVER_STATUS_DOWN);
        });

    const handleGetSession = async () => getSessionStatus()
        .then(() => {
            setUserSessionStatus(VALID_USER_SESSION);
        })
        .catch(() => {
            setUserSessionStatus();
        });

    useEffect(() => {
        handleGetSession();
        handleGetStatus();
    });

    useInterval(handleGetSession, SESSION_STATUS_CHECK_DELAY);
    useInterval(handleGetStatus, SERVER_STATUS_CHECK_DELAY);

    return (
        <StatusContext.Provider
            value={{
                serverStatus,
                userSessionStatus
            }}
        >
            {children}
        </StatusContext.Provider>
    );
};

export default StatusContext;
