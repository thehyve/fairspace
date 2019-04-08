import {getVocabulary} from "./vocabularySelectors";

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
