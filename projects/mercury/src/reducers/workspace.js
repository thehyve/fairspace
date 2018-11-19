import {promiseReducerFactory} from "../utils/redux";
import {WORKSPACE} from "../actions/actionTypes";

const defaultState = {};

export default promiseReducerFactory(WORKSPACE, defaultState);
