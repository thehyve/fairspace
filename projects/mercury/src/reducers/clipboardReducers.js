import * as actionTypes from "../actions/actionTypes";
import {COPY, CUT} from '../constants';

const defaultState = {
    type: null,
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
                filenames: action.filenames
            };
        case actionTypes.CLIPBOARD_COPY:
            return {
                ...state,
                type: COPY,
                filenames: action.filenames
            };
        case actionTypes.CLIPBOARD_PASTE_PENDING:
            return {
                ...state,
                pending: true
            };
        case actionTypes.CLIPBOARD_PASTE_FULFILLED:
            return {
                ...state,
                error: false,
                pending: false,
                type: null,
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
