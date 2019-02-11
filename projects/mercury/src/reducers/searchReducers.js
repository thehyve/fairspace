import * as actionTypes from "../actions/actionTypes";

const defaultState = {
    term: ''
};

const clipboard = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.OPEN_SEARCH:
            return {
                ...state,
                term: action.term
            };
        default:
            return state;
    }
};

export default clipboard;
