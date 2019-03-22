import * as actionTypes from "../actions/actionTypes";

const initialState = {
    pending: false,
    results: {items: [], total: 0},
    error: null
};

const determineErrorMessage = (payload) => {
    switch (payload.status) {
        case 400: return "Oops, we're unable to parse this query. Please only use alphanumeric characters.";
        default: return "Error retrieving search results";
    }
}

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
                error: determineErrorMessage(action.payload)
            };
        default:
            return state;
    }
};

export default searchReducer;
