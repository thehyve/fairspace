import { combineReducers } from 'redux'
import account from './account'
import cache from './cache'
import metadataBySubject from "./metadataBySubject";

export default combineReducers({
    account,
    cache,
    metadataBySubject
})
