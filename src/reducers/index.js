import { combineReducers } from 'redux'
import account from './account/'
import cache from './cache/'
import metadataBySubject from "./metadataBySubject";
import collectionBrowser from "./collectionBrowser";
import clipboard from "./clipboard";

export default combineReducers({
    account,
    cache,
    metadataBySubject,
    collectionBrowser,
    clipboard
})
