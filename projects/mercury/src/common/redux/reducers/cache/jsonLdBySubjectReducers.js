import reduceReducers from 'reduce-reducers';

import * as actionTypes from '../../actions/actionTypes';

const defaultState = {};

const updateMetadataReducer = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_METADATA_FULFILLED:
        case actionTypes.DELETE_METADATA_FULFILLED:
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

export default reduceReducers(updateMetadataReducer, defaultState);

/**
 * Returns an object representing the metadata for the given subject
 * @param state
 * @param subject
 * @returns {*}
 */
export const getMetadataForSubject = (state, subject) => {
    const {cache: {jsonLdBySubject}} = state;
    if (jsonLdBySubject && jsonLdBySubject[subject] && !jsonLdBySubject[subject].pending && !jsonLdBySubject[subject].error) {
        return jsonLdBySubject[subject].data || [];
    }

    return [];
};

export const isMetadataPending = (state, subject) => state.cache && state.cache.jsonLdBySubject && state.cache.jsonLdBySubject[subject] && state.cache.jsonLdBySubject[subject].pending;
export const hasMetadataError = (state, subject) => !!(state.cache && state.cache.jsonLdBySubject && state.cache.jsonLdBySubject[subject] && state.cache.jsonLdBySubject[subject].error);
