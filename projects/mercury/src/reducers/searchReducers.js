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

//* ********************
//* * SELECTORS
//* ********************

export const getCollectionsSearchResults = ({collectionSearch}) => {
    const {data, ...rest} = collectionSearch;
    const {items, total} = data || {...initialState.data};
    return {items, total, ...rest};
};

export const getMetadataSearchResults = ({metadataSearch}) => {
    const {data, ...rest} = metadataSearch;
    const {items, total} = data || {...initialState.data};
    return {items, total, ...rest};
};
