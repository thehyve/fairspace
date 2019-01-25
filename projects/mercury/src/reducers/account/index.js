import {combineReducers} from 'redux';
import user from './userReducers';
import authorizations from './authorizationsReducers';

export default combineReducers({
    user,
    authorizations
});
