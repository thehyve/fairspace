import * as actionTypes from "../actions/actionTypes";
import {COPY, CUT} from "../actions/clipboard";

const defaultState = {
    type: null,
    sourcedir: null,
    filenames: [],
    pending: false,
    error: false
};

const clipboard = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CLIPBOARD_CUT:
            return {
                ...state,
                type: CUT,
                sourcedir: action.sourcedir,
                filenames: action.filenames
            };
        case actionTypes.CLIPBOARD_COPY:
            return {
                ...state,
                type: COPY,
                sourcedir: action.sourcedir,
                filenames: action.filenames
            };
        case actionTypes.CLIPBOARD_PASTE_PENDING:
            return {
                ...state,
                pending: true
            };
        case actionTypes.CLIPBOARD_PASTE_FULFILLED:
        case actionTypes.CLIPBOARD_CLEAR:
            return {
                ...state,
                pending: false,
                type: null,
                sourcedir: null,
                filenames: []
            };
        case actionTypes.CLIPBOARD_PASTE_REJECTED:
            return {
                ...state,
                pending: false,
                error: action.payload || true
            };
        default:
            return state;
    }
};

export default clipboard;
