import {FETCH_USERS} from "../../actions/actionTypes";
import {promiseReducerFactory} from "../../utils/redux";

export default promiseReducerFactory(FETCH_USERS, null);

export const getUsers = ({cache: {users}}) => users.data;
export const isUsersPending = ({cache: {users}}) => !!users.pending;
export const hasUsersError = ({cache: {users}}) => !!users.error;
