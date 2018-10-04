import {USERS} from "../actions/actionTypes";
import {promiseReducerFactory} from "../utils/redux";
const defaultState = {};

export default promiseReducerFactory(USERS, defaultState);
