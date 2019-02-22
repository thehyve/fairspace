import * as actionTypes from "../actions/actionTypes";

const initialState = {
    pending: false,
    searchType: null,
    results: [],
    error: null
};

const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.PERFORM_SEARCH_PENDING:
            return {
                ...state,
                pending: true,
                searchType: action.meta ? action.meta.searchType : null,
                results: []
            };
        case actionTypes.PERFORM_SEARCH_FULFILLED:
            return {
                ...state,
                pending: false,
                error: null,
                searchType: action.meta ? action.meta.searchType : null,
                results: [...action.payload]
            };
        case actionTypes.PERFORM_SEARCH_REJECTED:
            return {
                ...state,
                pending: false,
                error: action.payload.error
            };
        default:
            return state;
    }
};

export default searchReducer;
