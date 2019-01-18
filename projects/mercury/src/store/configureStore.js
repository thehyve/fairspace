import {applyMiddleware, createStore, compose} from "redux";
import promiseMiddleware from "redux-promise-middleware";
import thunk from 'redux-thunk';
import rootReducer from "../reducers";

// This is required for 'Redux DevTools Extension' (https://github.com/zalmoxisus/redux-devtools-extension)
// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default (initialState) => createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(thunk, promiseMiddleware()))
);
