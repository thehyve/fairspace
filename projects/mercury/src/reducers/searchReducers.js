import {promiseReducerFactory} from "../utils/redux";
import * as actionTypes from "../actions/actionTypes";

const initialState = {
    pending: false,
    data: {
        items: [],
        total: 0
    },
    error: null
};

export const metadataSearchReducer = promiseReducerFactory(actionTypes.METADATA_SEARCH, initialState);

export const collectionsSearchReducer = promiseReducerFactory(actionTypes.COLLECTIONS_SEARCH, initialState);

export const vocabularySearchReducer = promiseReducerFactory(actionTypes.VOCABULARY_SEARCH, initialState);

//* ********************
//* * SELECTORS
//* ********************

export const destrctureSearchState = (state) => {
    const {data, ...rest} = state;
    const {items, total} = data || {...initialState.data};
    return {items, total, ...rest};
};

export const getCollectionsSearchResults = ({collectionSearch}) => destrctureSearchState(collectionSearch);

export const getMetadataSearchResults = ({metadataSearch}) => destrctureSearchState(metadataSearch);

export const getVocabularySearchResults = ({vocabularySearch}) => destrctureSearchState(vocabularySearch);
