import {SearchAPI, handleSearchError, SORT_DATE_CREATED} from "@fairspace/shared-frontend";

import {COLLECTIONS_SEARCH, METADATA_SEARCH, VOCABULARY_SEARCH} from "./actionTypes";
import {createErrorHandlingPromiseAction} from "../../utils/redux";
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI, SEARCH_MAX_SIZE, ES_INDEX} from '../../../constants';
import Config from "../../services/Config";

const COLLECTION_DIRECTORIES_FILES = [DIRECTORY_URI, FILE_URI, COLLECTION_URI];

export const searchCollections = createErrorHandlingPromiseAction((query) => ({
    type: COLLECTIONS_SEARCH,
    payload: SearchAPI(Config.get(), ES_INDEX)
        .search({query, types: COLLECTION_DIRECTORIES_FILES, size: SEARCH_MAX_SIZE, sort: SORT_DATE_CREATED})
        .catch(handleSearchError),
    meta: {
        query
    }
}));

export const searchMetadata = createErrorHandlingPromiseAction(({query, types, size, page}) => ({
    type: METADATA_SEARCH,
    payload: SearchAPI(Config.get(), ES_INDEX)
        .searchLinkedData({types, query, size, page, sort: SORT_DATE_CREATED})
        .catch(handleSearchError)
}));

export const searchVocabulary = createErrorHandlingPromiseAction(({query, types, size, page}) => ({
    type: VOCABULARY_SEARCH,
    payload: SearchAPI(Config.get(), ES_INDEX)
        .searchLinkedData({query, types, size, page, sort: SORT_DATE_CREATED})
        .catch(handleSearchError)
}));
