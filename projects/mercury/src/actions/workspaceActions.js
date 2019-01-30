import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {FETCH_USERS, FETCH_WORKSPACE} from "./actionTypes";
import WorkspaceAPI from "../services/WorkspaceAPI";

export const fetchWorkspace = createErrorHandlingPromiseAction(() => ({
    type: FETCH_WORKSPACE,
    payload: WorkspaceAPI.getWorkspace(),
}));

export const fetchUsers = createErrorHandlingPromiseAction(() => ({
    type: FETCH_USERS,
    payload: WorkspaceAPI.getUsers(),
}));

export const fetchUsersIfNeeded = () => dispatchIfNeeded(
    fetchUsers,
    state => (state && state.cache ? state.cache.users : undefined)
);
