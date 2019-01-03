import {applyMiddleware, createStore} from "redux";
import promiseMiddleware from "redux-promise-middleware";
import thunk from 'redux-thunk';
import rootReducer from "../reducers";

export default (initialState) => createStore(
    rootReducer,
    initialState,
    applyMiddleware(thunk, promiseMiddleware())
);
