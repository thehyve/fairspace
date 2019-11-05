import {combineReducers} from 'redux';
import cache from './cache';
import {collectionsSearchReducer, metadataSearchReducer, vocabularySearchReducer} from './searchReducers';

export default combineReducers({
    cache,
    collectionSearch: collectionsSearchReducer,
    metadataSearch: metadataSearchReducer,
    vocabularySearch: vocabularySearchReducer
});
