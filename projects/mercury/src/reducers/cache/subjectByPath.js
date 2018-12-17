import {METADATA_URI_BY_PATH} from "../../actions/actionTypes";
import * as actionTypes from "../../utils/redux-action-types";

export default (state = {}, action) => {
    switch (action.type) {
        case actionTypes.pending(METADATA_URI_BY_PATH):
            return {
                ...state,
                [action.meta.path]: {pending: true}
            };
        case actionTypes.fulfilled(METADATA_URI_BY_PATH):
            return {
                ...state,
                [action.meta.path]: {data: action.payload}
            };
        case actionTypes.rejected(METADATA_URI_BY_PATH):
            return {
                ...state,
                [action.meta.path]: {error: action.payload || true}
            };
        default:
            return state;
    }
};
