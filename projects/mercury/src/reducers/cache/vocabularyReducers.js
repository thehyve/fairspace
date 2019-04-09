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


/**
 * Returns a list of entities in the vocabulary
 * @param state
 * @returns {Array}
 */
export const getVocabularyEntities = ({cache: {vocabularyEntities}}) => {
    if (vocabularyEntities && !vocabularyEntities.pending && !vocabularyEntities.error) {
        return vocabularyEntities.data;
    }

    return [];
};

export const isVocabularyEntitiesPending = state => !state.cache || !state.cache.allVocabularyEntities || state.cache.allVocabularyEntities.pending;
export const hasVocabularyEntitiesError = state => !state.cache || !state.cache.allVocabularyEntities || state.cache.allVocabularyEntities.error;


/**
 * Returns an object representing the meta vocabulary
 * @param state
 * @returns {Vocabulary}
 */
export const getMetaVocabulary = ({cache: {metaVocabulary}}) => {
    if (metaVocabulary && !metaVocabulary.pending && !metaVocabulary.error) {
        return new Vocabulary(metaVocabulary.data);
    }

    return new Vocabulary();
};

export const isMetaVocabularyPending = state => !state.cache || !state.cache.metaVocabulary || state.cache.metaVocabulary.pending;
export const hasMetaVocabularyError = state => !state.cache || !state.cache.metaVocabulary || state.cache.metaVocabulary.error;
