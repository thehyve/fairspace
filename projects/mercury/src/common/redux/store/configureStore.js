import {applyMiddleware, compose, createStore} from "redux";
import promiseMiddleware from "redux-promise-middleware";
import thunk from 'redux-thunk';
import rootReducer from "../reducers";

const configureStore = () => {
    // This is required for 'Redux DevTools Extension' (https://github.com/zalmoxisus/redux-devtools-extension)
    // eslint-disable-next-line no-underscore-dangle
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store = createStore(
        rootReducer,
        {},
        composeEnhancers(applyMiddleware(thunk, promiseMiddleware))
    );

    return store;
};

export default configureStore;
