import * as actionTypes from "../actions/actionTypes";

const initialState = {
    pending: false,
    items: [],
    total: 0,
    error: null
};

const genericSearchReducer = (state = initialState, action) => {
    if (action.type.endsWith('PENDING')) {
        return {
            ...state,
            pending: true,
            items: [],
            total: 0
        };
    }
    if (action.type.endsWith('FULFILLED')) {
        return {
            ...state,
            pending: false,
            error: null,
            ...action.payload
        };
    }
    if (action.type.endsWith('REJECTED')) {
        return {
            ...state,
            pending: false,
            items: [],
            total: 0,
            error: action.payload.message
        };
    }
    return state;
};

export const collectionsSearchReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.COLLECTIONS_SEARCH_PENDING:
            return genericSearchReducer(state, action);
        case actionTypes.COLLECTIONS_SEARCH_FULFILLED:
            return genericSearchReducer(state, action);
        case actionTypes.COLLECTIONS_SEARCH_REJECTED:
            return genericSearchReducer(state, action);
        default:
            return state;
    }
};

export const metadataSearchReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.METADATA_SEARCH_PENDING:
            return genericSearchReducer(state, action);
        case actionTypes.METADATA_SEARCH_FULFILLED:
            return genericSearchReducer(state, action);
        case actionTypes.METADATA_SEARCH_REJECTED:
            return genericSearchReducer(state, action);
        default:
            return state;
    }
};


//* ********************
//* * SELECTORS
//* ********************

export const getCollectionsSearchResults = ({collectionSearch}) => collectionSearch;

export const getMetadataSearchResults = ({metadataSearch}) => metadataSearch;
