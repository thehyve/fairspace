import axios from "axios";
import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";

export const SERVER_STATUS_UP = "UP";
export const SERVER_STATUS_DOWN = "DOWN";
export type ServerStatus = SERVER_STATUS_UP | SERVER_STATUS_DOWN;
export type StatusResponse = {
    status: ServerStatus;
}
export type ConfigResponse = {
    maxFileSize: string;
    maxFileSizeBytes: ?number;
}

const requestOptions = {
    headers: {Accept: 'application/json'}
};

export const getSessionStatus = () => axios.get('/api/status', requestOptions)
    .catch(handleHttpError("Failure when retrieving session's information"));

export const getServerStatus = (): StatusResponse => axios.get('/actuator/health', requestOptions)
    .then(extractJsonData)
    .then((res: StatusResponse) => ({status: res.status ? res.status.toString().toUpperCase() : SERVER_STATUS_DOWN}))
    .catch(handleHttpError("Failure when retrieving server status"));

export const getServerConfig = (): ConfigResponse => axios.get('/api/config', requestOptions)
    .then(extractJsonData)
    .then((res: ConfigResponse) => ({
        maxFileSize: res.maxFileSize,
        maxFileSizeBytes: res.maxFileSizeBytes
    }))
    .catch(handleHttpError("Failure when retrieving server config"));
