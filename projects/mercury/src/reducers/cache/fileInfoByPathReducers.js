import * as actionTypes from "../../actions/actionTypes";

export default (state = {}, action) => {
    switch (action.type) {
        case actionTypes.STAT_FILE_PENDING:
            return {
                ...state,
                [action.meta.path]: {pending: true}
            };
        case actionTypes.STAT_FILE_FULFILLED:
            return {
                ...state,
                [action.meta.path]: {data: action.payload}
            };
        case actionTypes.STAT_FILE_REJECTED:
            return {
                ...state,
                [action.meta.path]: {error: action.payload || true}
            };
        default:
            return state;
    }
};

export const getFileInfoByPath = (state, path) => (state.cache.fileInfoByPath && state.cache.fileInfoByPath[path] && state.cache.fileInfoByPath[path].data) || {};

export const hasFileInfoErrorByPath = (state, path) => (state.cache.fileInfoByPath && state.cache.fileInfoByPath[path] && state.cache.fileInfoByPath[path].error);

export const isFileInfoByPathPending = (state, path) => (state.cache.fileInfoByPath && state.cache.fileInfoByPath[path] && state.cache.fileInfoByPath[path].pending);
