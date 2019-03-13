import * as actionTypes from "../actions/actionTypes";

const initialState = {
    pending: false,
    results: {},
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

                // eslint-disable-next-line prefer-template
                error: "Error retrieving search results" + (action.payload ? ": " + action.payload.message : "")
            };
        default:
            return state;
    }
};

export default searchReducer;
