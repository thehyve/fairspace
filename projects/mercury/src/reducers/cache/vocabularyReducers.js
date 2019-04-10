import Vocabulary from "../../services/Vocabulary";

import {promiseReducerFactory} from "../../utils/redux";
import {FETCH_VOCABULARY} from "../../actions/actionTypes";

export default promiseReducerFactory(FETCH_VOCABULARY, {invalidated: true, data: []});

/**
 * Returns an object representing the vocabulary
 * @param state
 * @returns {Vocabulary}
 */
export const getVocabulary = ({cache: {vocabulary}}) => new Vocabulary(vocabulary ? vocabulary.data : []);
export const isVocabularyPending = ({cache: {vocabulary}}) => !!vocabulary.pending;
export const hasVocabularyError = ({cache: {vocabulary}}) => !!vocabulary.error;


/**
 * Returns a list of entities in the vocabulary
 * @param state
 * @returns {Array}
 */
export const getVocabularyEntities = ({cache: {allVocabularyEntities}}) => allVocabularyEntities.data || [];
export const isVocabularyEntitiesPending = ({cache: {allVocabularyEntities}}) => !!allVocabularyEntities.pending;
export const hasVocabularyEntitiesError = ({cache: {allVocabularyEntities}}) => !!allVocabularyEntities.error;


/**
 * Returns an object representing the meta vocabulary
 * @param state
 * @returns {Vocabulary}
 */
export const getMetaVocabulary = ({cache: {metaVocabulary}}) => new Vocabulary(metaVocabulary.data);
export const isMetaVocabularyPending = ({cache: {metaVocabulary}}) => !!metaVocabulary.pending;
export const hasMetaVocabularyError = ({cache: {metaVocabulary}}) => !!metaVocabulary.error;
