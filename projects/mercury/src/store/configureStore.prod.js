import {applyMiddleware, createStore} from "redux";
import rootReducer from "../reducers";
import promiseMiddleware from "redux-promise-middleware";
import thunk from 'redux-thunk';
import initializeState from "./initializeState";
import menuStateInLocalStorage from "./menuStateInLocalStorage";

export default () => createStore(
    rootReducer,
    initializeState(),
    applyMiddleware(thunk, promiseMiddleware(), menuStateInLocalStorage)
);
