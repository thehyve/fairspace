import reduceReducers from "reduce-reducers";
import {promiseReducerFactory} from "../../utils/redux";
import Vocabulary from "../../services/Vocabulary";
import * as actionTypes from "../../actions/actionTypes";

const defaultState = {invalidated: true, data: []};

const fetchVocabularyReducer = promiseReducerFactory(actionTypes.FETCH_VOCABULARY, defaultState);

const updateVocabularyReducer = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_VOCABULARY_FULFILLED:
            return {
                ...state,
                invalidated: true
            };
        default:
            return state;
    }
};

export default reduceReducers(fetchVocabularyReducer, updateVocabularyReducer, defaultState);

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
