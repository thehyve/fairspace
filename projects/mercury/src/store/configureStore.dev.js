import {applyMiddleware, createStore} from "redux";
// import {createLogger} from "redux-logger";
import promiseMiddleware from "redux-promise-middleware";
import thunk from 'redux-thunk';
import rootReducer from "../reducers";
import menuStateInLocalStorage from "./menuStateInLocalStorage";
import initializeState from "./initializeState";

export default () => createStore(
    rootReducer,
    initializeState(),
    applyMiddleware(thunk, promiseMiddleware(), menuStateInLocalStorage)
);
