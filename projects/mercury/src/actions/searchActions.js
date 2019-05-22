import {COLLECTIONS_SEARCH, METADATA_SEARCH} from "./actionTypes";
import {createErrorHandlingPromiseAction} from "../utils/redux";
import searchAPI from "../services/SearchAPI";
import {fetchMetadataVocabularyIfNeeded} from "./vocabularyActions";
import {getVocabulary} from "../reducers/cache/vocabularyReducers";
import {getFirstPredicateId} from "../utils/linkeddata/jsonLdUtils";
import * as constants from "../constants";

export const searchCollections = createErrorHandlingPromiseAction((query) => ({
    type: COLLECTIONS_SEARCH,
    payload: searchAPI().searchCollections(query),
    meta: {
        query
    }
}));

export const searchMetadata = (query) => (dispatch, getState) => dispatch({
    type: METADATA_SEARCH,
    payload: dispatch(fetchMetadataVocabularyIfNeeded())
        .then(() => {
            const vocabulary = getVocabulary(getState());
            const iris = vocabulary.getClassesInCatalog()
                .map(c => getFirstPredicateId(c, constants.SHACL_TARGET_CLASS));
            return searchAPI().searchMetadata(iris, query);
        })
});
