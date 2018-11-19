import { combineReducers } from 'redux'
import account from './account'
import permissions from './permissions'
import cache from './cache'
import metadataBySubject from "./metadataBySubject";
import collectionBrowser from "./collectionBrowser";
import clipboard from "./clipboard";
import workspace from './workspace';
import ui from "./ui";

export default combineReducers({
    account,
    permissions,
    cache,
    metadataBySubject,
    collectionBrowser,
    workspace,
    clipboard,
    ui
})
