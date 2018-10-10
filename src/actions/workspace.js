import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {USERS, WORKSPACE} from "./actionTypes";
import WorkspaceAPI from "../services/WorkspaceAPI/WorkspaceAPI";

export const fetchWorkspace = createErrorHandlingPromiseAction(() => ({
    type: WORKSPACE,
    payload: WorkspaceAPI.getWorkspace(),
}));

export const fetchUsersIfNeeded = () => dispatchIfNeeded(
    fetchUsers,
    state => state && state.cache ? state.cache.users : undefined
);

export const fetchUsers = createErrorHandlingPromiseAction(() => ({
    type: USERS,
    payload: WorkspaceAPI.getUsers(),
}));
