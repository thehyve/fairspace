import {promiseReducerFactory} from "../utils/redux";
import {FETCH_WORKSPACE} from "../actions/actionTypes";

const defaultState = {};

export default promiseReducerFactory(FETCH_WORKSPACE, defaultState);
