import {promiseReducerFactory} from "../../utils/redux";
import {FETCH_USER} from "../../actions/actionTypes";

export default promiseReducerFactory(FETCH_USER);

export const getUser = ({account: {user}}) => user.data;
export const isUserPending = ({account: {user}}) => !!user.pending;
export const hasUserError = ({account: {user}}) => !!user.error;
