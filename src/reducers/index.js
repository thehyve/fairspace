import { combineReducers } from 'redux'
import account from './account'
import permissions from './permissions'
import cache from './cache'
import metadataBySubject from "./metadataBySubject";
import collectionBrowser from "./collectionBrowser";
import clipboard from "./clipboard";
import users from "./users";

export default combineReducers({
    account,
    permissions,
    cache,
    metadataBySubject,
    collectionBrowser,
    users,
    clipboard
})
