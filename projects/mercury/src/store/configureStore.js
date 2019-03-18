import {applyMiddleware, createStore, compose} from "redux";
import promiseMiddleware from "redux-promise-middleware";
import thunk from 'redux-thunk';
import rootReducer from "../reducers";
import {LOCAL_STORAGE_MENU_KEY} from '../constants';

const configureStore = () => {
    // This is required for 'Redux DevTools Extension' (https://github.com/zalmoxisus/redux-devtools-extension)
    // eslint-disable-next-line no-underscore-dangle
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const menuExpanded = window.localStorage.getItem(LOCAL_STORAGE_MENU_KEY) !== 'false';
    const uiState = {ui: {menuExpanded, pending: {}}};

    const store = createStore(
        rootReducer,
        uiState,
        composeEnhancers(applyMiddleware(thunk, promiseMiddleware))
    );

    store.subscribe(() => {
        window.localStorage.setItem(LOCAL_STORAGE_MENU_KEY, store.getState().ui.menuExpanded);
    });

    return store;
};

export default configureStore;
