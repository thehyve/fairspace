import UserAPI from '../services/UserAPI/UserAPI'
import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {USERS} from "./actionTypes";

export const fetchUsersIfNeeded = () => dispatchIfNeeded(
    fetchUsers,
    state => state && state.cache ? state.cache.users : undefined
);

export const fetchUsers = createErrorHandlingPromiseAction(() => ({
    type: USERS,
    payload: UserAPI.getUsers(),
}));
