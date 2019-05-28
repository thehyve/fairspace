import {COLLECTIONS_SEARCH, METADATA_SEARCH} from "./actionTypes";
import {createErrorHandlingPromiseAction} from "../utils/redux";
import searchAPI from "../services/SearchAPI";

export const searchCollections = createErrorHandlingPromiseAction((query) => ({
    type: COLLECTIONS_SEARCH,
    payload: searchAPI().searchCollections(query),
    meta: {
        query
    }
}));

export const searchMetadata = createErrorHandlingPromiseAction((query, types) => ({
    type: METADATA_SEARCH,
    payload: searchAPI().searchMetadata(types, query)
}));
