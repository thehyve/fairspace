import * as searchAPI from "../services/SearchAPI";
import * as actionTypes from "./actionTypes";
import {getSearchTypeFromString} from '../utils/searchUtils';

const performSearchPending = (searchType) => ({
    type: actionTypes.PERFORM_SEARCH_PENDING,
    searchType,
});

const performSearchFulfilled = (results, searchType) => ({
    type: actionTypes.PERFORM_SEARCH_FULFILLED,
    searchType,
    payload: [...results]
});

const performSearchRejected = error => ({
    type: actionTypes.PERFORM_SEARCH_REJECTED,
    payload: {
        error
    }
});

// eslint-disable-next-line import/prefer-default-export
export const performSearch = (query) => (dispatch) => {
    const searchType = getSearchTypeFromString(query);
    dispatch(performSearchPending(searchType));
    searchAPI.performSearch(query)
        .then(res => dispatch(performSearchFulfilled(res, searchType)))
        .catch(err => {
            dispatch(performSearchRejected(err.message));
        });
};
