import {combineReducers} from 'redux';
import cache from './cache';
import collectionBrowser from "./collectionBrowserReducers";
import clipboard from "./clipboardReducers";
import uploads from "./uploadsReducers";
import {collectionsSearchReducer, metadataSearchReducer, vocabularySearchReducer} from './searchReducers';

export default combineReducers({
    cache,
    collectionBrowser,
    clipboard,
    uploads,
    collectionSearch: collectionsSearchReducer,
    metadataSearch: metadataSearchReducer,
    vocabularySearch: vocabularySearchReducer
});
