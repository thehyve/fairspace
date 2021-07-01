import axios from "axios";
import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";

export const SERVER_STATUS_UP = "UP";
export const SERVER_STATUS_DOWN = "DOWN";
export type ServerStatus = SERVER_STATUS_UP | SERVER_STATUS_DOWN;
export type StatusResponse = {
    status: ServerStatus;
}

const requestOptions = {
    headers: {Accept: 'application/json'}
};

export const getSessionStatus = () => axios.get('/api/status', requestOptions)
    .catch(handleHttpError("Failure when retrieving session's information"));

export const getServerStatus = (): StatusResponse => axios.get('/actuator/health', requestOptions)
    .then(extractJsonData)
    .then((res: StatusResponse) => ({status: res.status ? res.status.toString().toUpperCase() : SERVER_STATUS_DOWN}))
    .catch(handleHttpError("Failure when retrieving user's information"));
