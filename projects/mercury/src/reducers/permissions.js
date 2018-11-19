import {ALTER_PERMISSION, PERMISSIONS} from "../actions/actionTypes";
import {promiseReducerFactory} from "../utils/redux";
import { combineReducers } from 'redux'

const defaultState = {};
const permissionsReducer = promiseReducerFactory(PERMISSIONS, defaultState);
const alterPermissionReducer =  promiseReducerFactory(ALTER_PERMISSION, defaultState);

export default combineReducers({
    fetch: permissionsReducer,
    alter: alterPermissionReducer
})
