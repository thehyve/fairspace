import {createErrorHandlingPromiseAction} from "../utils/redux";
import {WORKSPACE} from "./actionTypes";
import WorkspaceAPI from "../services/WorkspaceAPI/WorkspaceAPI";

export const fetchWorkspace = createErrorHandlingPromiseAction(() => ({
    type: WORKSPACE,
    payload: WorkspaceAPI.getWorkspace(),
}));
