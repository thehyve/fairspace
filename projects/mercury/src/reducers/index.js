import {combineReducers} from 'redux';
import cache from './cache';
import collectionBrowser from "./collectionBrowserReducers";
import clipboard from "./clipboardReducers";
import workspace from './workspaceReducers';
import ui from "./uiReducers";
import {collectionsSearchReducer, metadataSearchReducer, vocabularySearchReducer} from './searchReducers';

export default combineReducers({
    cache,
    collectionBrowser,
    workspace,
    clipboard,
    ui,
    collectionSearch: collectionsSearchReducer,
    metadataSearch: metadataSearchReducer,
    vocabularySearch: vocabularySearchReducer
});
