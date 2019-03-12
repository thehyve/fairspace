import searchAPI from "../services/SearchAPI";
import * as actionTypes from "./actionTypes";
import {createErrorHandlingPromiseAction} from "../utils/redux";

export const performSearch = createErrorHandlingPromiseAction((query, searchType) => ({
    type: actionTypes.PERFORM_SEARCH,
    payload: searchAPI().performSearch(query, searchType),
    meta: {
        searchType,
        query
    }
}));
