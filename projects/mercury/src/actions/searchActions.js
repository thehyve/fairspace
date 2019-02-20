import * as searchAPI from "../services/SearchAPI";
import * as actionTypes from "./actionTypes";
import {getSearchTypeFromString} from '../utils/searchUtils';
import {createErrorHandlingPromiseAction} from "../utils/redux";

export const performSearch = createErrorHandlingPromiseAction((query) => ({
    type: actionTypes.PERFORM_SEARCH,
    payload: searchAPI.performSearch(query),
    meta: {
        searchType: getSearchTypeFromString(query)
    }
}));
