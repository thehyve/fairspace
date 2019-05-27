import {combineReducers} from 'redux';
import account from './account';
import cache from './cache';
import collectionBrowser from "./collectionBrowserReducers";
import clipboard from "./clipboardReducers";
import workspace from './workspaceReducers';
import ui from "./uiReducers";
import {collectionsSearchReducer, metadataSearchReducer} from './searchReducers';
import linkedDataForm from './linkedDataFormReducers';

export default combineReducers({
    account,
    cache,
    collectionBrowser,
    workspace,
    clipboard,
    ui,
    collectionSearch: collectionsSearchReducer,
    metadataSearch: metadataSearchReducer,
    linkedDataForm
});
