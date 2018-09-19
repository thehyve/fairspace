import {applyMiddleware, createStore} from "redux";
import {createLogger} from "redux-logger";
import rootReducer from "../reducers";
import promiseMiddleware from "redux-promise-middleware";
import thunk from 'redux-thunk';

export default createStore(
    rootReducer,
    applyMiddleware(thunk, promiseMiddleware(), createLogger())
);
