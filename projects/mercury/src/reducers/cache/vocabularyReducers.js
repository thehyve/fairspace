import Vocabulary from "../../services/Vocabulary";

import {promiseReducerFactory} from "../../utils/redux";
import {FETCH_METADATA_VOCABULARY} from "../../actions/actionTypes";

export default promiseReducerFactory(FETCH_METADATA_VOCABULARY, null);

/**
 * Returns an object representing the vocabulary
 * @param state
 * @returns {Vocabulary}
 */
export const getVocabulary = ({cache: {vocabulary}}) => {
    if (vocabulary && !vocabulary.pending && !vocabulary.error) {
        return new Vocabulary(vocabulary.data);
    }

    return new Vocabulary();
};

export const isVocabularyPending = state => !state.cache || !state.cache.vocabulary || state.cache.vocabulary.pending;
export const hasVocabularyError = state => !state.cache || !state.cache.vocabulary || state.cache.vocabulary.error;
