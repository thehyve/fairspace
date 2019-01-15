import {FETCH_METADATA_URI_BY_PATH} from "../../actions/actionTypes";
import * as actionTypes from "../../utils/redux-action-types";

export default (state = {}, action) => {
    switch (action.type) {
        case actionTypes.pending(FETCH_METADATA_URI_BY_PATH):
            return {
                ...state,
                [action.meta.path]: {pending: true}
            };
        case actionTypes.fulfilled(FETCH_METADATA_URI_BY_PATH):
            return {
                ...state,
                [action.meta.path]: {data: action.payload}
            };
        case actionTypes.rejected(FETCH_METADATA_URI_BY_PATH):
            return {
                ...state,
                [action.meta.path]: {error: action.payload || true}
            };
        default:
            return state;
    }
};
