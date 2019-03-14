import * as actionTypes from "../actions/actionTypes";

const initialState = {
    pending: false,
    results: {results: [], total: 0},
    error: null
};

const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.PERFORM_SEARCH_PENDING:
            return {
                ...state,
                pending: true,
                results: {}
            };
        case actionTypes.PERFORM_SEARCH_FULFILLED:
            return {
                ...state,
                pending: false,
                error: null,
                results: {...action.payload}
            };
        case actionTypes.PERFORM_SEARCH_REJECTED:
            return {
                ...state,
                pending: false,
                error: "Error retrieving search results"
            };
        default:
            return state;
    }
};

export default searchReducer;
