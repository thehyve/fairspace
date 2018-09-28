import {ALTER_PERMISSION, PERMISSIONS} from "../actions/actionTypes";
import {promiseReducerFactory} from "../utils/redux";
import combineReducers from "redux/src/combineReducers";

const defaultStateItem = {
    data: [],
    pending: false,
    error: false
};

const permissionsReducer = promiseReducerFactory(PERMISSIONS, defaultStateItem);
const alterPermissionReducer =  promiseReducerFactory(ALTER_PERMISSION, defaultStateItem);

export default combineReducers({
    fetch: permissionsReducer,
    alter: alterPermissionReducer
})
