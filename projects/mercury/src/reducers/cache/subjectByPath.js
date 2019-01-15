import * as actionTypes from "../../actions/actionTypes";

export default (state = {}, action) => {
    switch (action.type) {
        case actionTypes.FETCH_METADATA_URI_BY_PATH_PENDING:
            return {
                ...state,
                [action.meta.path]: {pending: true}
            };
        case actionTypes.FETCH_METADATA_URI_BY_PATH_FULFILLED:
            return {
                ...state,
                [action.meta.path]: {data: action.payload}
            };
        case actionTypes.FETCH_METADATA_URI_BY_PATH_REJECTED:
            return {
                ...state,
                [action.meta.path]: {error: action.payload || true}
            };
        default:
            return state;
    }
};
