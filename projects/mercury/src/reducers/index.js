import {combineReducers} from 'redux';
import account from './account';
import cache from './cache';
import collectionBrowser from "./collectionBrowserReducers";
import clipboard from "./clipboardReducers";
import workspace from './workspaceReducers';
import ui from "./uiReducers";
import search from './searchReducers';
import metadataForm from './metadataFormReducers';

export default combineReducers({
    account,
    cache,
    collectionBrowser,
    workspace,
    clipboard,
    ui,
    search,
    metadataForm
});
