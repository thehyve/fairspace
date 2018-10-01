import UserAPI from '../services/UserAPI/UserAPI'
import {createErrorHandlingPromiseAction} from "../utils/redux";
import {USERS} from "./actionTypes";

export const fetchUsers = createErrorHandlingPromiseAction(() => ({
    type: USERS,
    payload: UserAPI.getUsers(),
}));
