import {createErrorHandlingPromiseAction} from "../utils/redux";
import {FETCH_WORKSPACE} from "./actionTypes";
import WorkspaceAPI from "../services/WorkspaceAPI";

export const fetchWorkspace = createErrorHandlingPromiseAction(() => ({
    type: FETCH_WORKSPACE,
    payload: WorkspaceAPI.getWorkspace(),
}));
