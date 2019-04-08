import Vocabulary from "../services/Vocabulary";

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
