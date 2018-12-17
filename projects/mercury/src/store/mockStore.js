import configureStore from 'redux-mock-store';
import promiseMiddleware from "redux-promise-middleware";
import thunk from 'redux-thunk';

export default configureStore([
    thunk,
    promiseMiddleware()
]);
