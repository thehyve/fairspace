import {CLIPBOARD_CLEAR, CLIPBOARD_COPY, CLIPBOARD_CUT, CLIPBOARD_PASTE} from "../actions/actionTypes";
import {COPY, CUT} from "../actions/clipboard";
import * as actionTypes from "../utils/redux-action-types";

const defaultState = {
    type: null,
    sourcedir: null,
    filenames: [],
    pending: false,
    error: false
};

const clipboard = (state = defaultState, action) => {
    switch (action.type) {
        case CLIPBOARD_CUT:
            return {
                ...state,
                type: CUT,
                sourcedir: action.sourcedir,
                filenames: action.filenames
            };
        case CLIPBOARD_COPY:
            return {
                ...state,
                type: COPY,
                sourcedir: action.sourcedir,
                filenames: action.filenames
            };
        case actionTypes.pending(CLIPBOARD_PASTE):
            return {
                ...state,
                pending: true
            };
        case actionTypes.fulfilled(CLIPBOARD_PASTE):
        case CLIPBOARD_CLEAR:
            return {
                ...state,
                pending: false,
                type: null,
                sourcedir: null,
                filenames: []
            };
        case actionTypes.rejected(CLIPBOARD_PASTE):
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
