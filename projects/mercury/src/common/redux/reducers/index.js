import {combineReducers} from 'redux';
import cache from './cache';
import collectionBrowser from "./collectionBrowserReducers";
import {collectionsSearchReducer, metadataSearchReducer, vocabularySearchReducer} from './searchReducers';

export default combineReducers({
    cache,
    collectionBrowser,
    collectionSearch: collectionsSearchReducer,
    metadataSearch: metadataSearchReducer,
    vocabularySearch: vocabularySearchReducer
});
