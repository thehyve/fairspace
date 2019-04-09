import reduceReducers from 'reduce-reducers';
import {promiseReducerFactory} from "../../utils/redux";
import * as actionTypes from "../../actions/actionTypes";
import {getVocabulary} from "./vocabularyReducers";

const defaultState = {};

const jsonLdFetchReducer = promiseReducerFactory(actionTypes.FETCH_METADATA, defaultState, action => action.meta.subject);

const updateMetadataReducer = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_METADATA_FULFILLED:
            return {
                ...state,
                [action.meta.subject]: {
                    ...state[action.meta.subject],
                    invalidated: true
                }
            };
        default:
            return state;
    }
};

export default reduceReducers(jsonLdFetchReducer, updateMetadataReducer, defaultState);

/**
 * Returns an object representing the metadata for the given subject
 * @param state
 * @param subject
 * @see {Vocabulary.combine}
 * @returns {*}
 */
export const getCombinedMetadataForSubject = (state, subject) => {
    const {cache: {jsonLdBySubject}} = state;
    if (jsonLdBySubject && jsonLdBySubject[subject] && !jsonLdBySubject[subject].pending && !jsonLdBySubject[subject].error) {
        const vocabulary = getVocabulary(state);
        return vocabulary.combine(jsonLdBySubject[subject].data, subject);
    }

    return [];
};

export const isMetadataPending = (state, subject) => !state.cache || !state.cache.jsonLdBySubject || !state.cache.jsonLdBySubject[subject] || state.cache.jsonLdBySubject[subject].pending;
export const hasMetadataError = (state, subject) => !state.cache || !state.cache.jsonLdBySubject || !state.cache.jsonLdBySubject[subject] || state.cache.jsonLdBySubject[subject].error;
