import * as actionTypes from "../actions/actionTypes";

const initialState = {
    pending: false,
    items: [],
    total: 0,
    error: null
};

const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.PERFORM_SEARCH_PENDING:
            return {
                ...state,
                pending: true,
                items: [],
                total: 0
            };
        case actionTypes.PERFORM_SEARCH_FULFILLED:
            return {
                ...state,
                pending: false,
                error: null,
                ...action.payload
            };
        case actionTypes.PERFORM_SEARCH_REJECTED:
            return {
                ...state,
                pending: false,
                items: [],
                total: 0,
                error: action.payload.message
            };
        default:
            return state;
    }
};

export default searchReducer;

export const getSearchResults = ({search}) => search;

export const isSearchPending = (state) => getSearchResults(state).pending;

export const hasSearchError = (state) => !!getSearchResults(state).error;
