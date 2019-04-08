import Vocabulary from "../services/Vocabulary";

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
