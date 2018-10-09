import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import WorkspaceAPI from '../services/WorkspaceAPI/WorkspaceAPI'
import {USERS} from "./actionTypes";

export const fetchUsersIfNeeded = () => dispatchIfNeeded(
    fetchUsers,
    state => state && state.cache ? state.cache.users : undefined
);

export const fetchUsers = createErrorHandlingPromiseAction(() => ({
    type: USERS,
    payload: WorkspaceAPI.getUsers(),
}));
