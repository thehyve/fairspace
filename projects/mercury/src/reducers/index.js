import {combineReducers} from 'redux';
import account from './account';
import cache from './cache';
import metadataBySubject from "./metadataBySubjectReducers";
import collectionBrowser from "./collectionBrowserReducers";
import clipboard from "./clipboardReducers";
import workspace from './workspaceReducers';
import ui from "./uiReducers";
import search from './searchReducers';

export default combineReducers({
    account,
    cache,
    metadataBySubject,
    collectionBrowser,
    workspace,
    clipboard,
    ui,
    search
});
