import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {MetaVocabularyAPI, VocabularyAPI} from "../services/LinkedDataAPI";
import * as actionTypes from "./actionTypes";
import {getMetaVocabulary, getVocabulary} from "../reducers/cache/vocabularyReducers";
import {getLinkedDataFormUpdates} from "../reducers/linkedDataFormReducers";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const submitVocabularyChangesFromState = (subject) => (dispatch, getState) => {
    const values = getLinkedDataFormUpdates(getState(), subject);
    const metaVocabulary = getMetaVocabulary(getState());
    return dispatch({
        type: actionTypes.UPDATE_VOCABULARY,
        payload: VocabularyAPI.updateEntity(subject, values, metaVocabulary),
        meta: {
            subject
        }
    });
};

export const createVocabularyEntityFromState = (formKey, subject, type) => (dispatch, getState) => {
    const values = getLinkedDataFormUpdates(getState(), formKey);
    const vocabulary = getVocabulary(getState());

    return dispatch({
        type: actionTypes.CREATE_VOCABULARY_ENTITY,
        payload: VocabularyAPI.get({subject})
            .then((meta) => {
                if (meta.length) {
                    throw Error(`Vocabulary entity already exists: ${subject}`);
                }
            })
            .then(() => VocabularyAPI.createEntity(subject, type, values, vocabulary))
            .then(() => ({subject, type, values})),
        meta: {
            subject,
            type
        }
    });
};

const fetchVocabulary = createErrorHandlingPromiseAction(() => ({
    type: actionTypes.FETCH_VOCABULARY,
    payload: VocabularyAPI.get()
}));

export const fetchMetadataVocabularyIfNeeded = () => dispatchIfNeeded(
    fetchVocabulary,
    state => (state && state.cache && state.cache.vocabulary)
);

const fetchMetaVocabulary = createErrorHandlingPromiseAction(() => ({
    type: actionTypes.FETCH_META_VOCABULARY,
    payload: MetaVocabularyAPI.get()
}));

export const fetchMetaVocabularyIfNeeded = () => dispatchIfNeeded(
    fetchMetaVocabulary,
    state => (state && state.cache && state.cache.metaVocabulary)
);

const fetchVocabularyEntitiesByType = createErrorHandlingPromiseAction(type => ({
    type: actionTypes.FETCH_VOCABULARY_ENTITIES,
    payload: VocabularyAPI.getEntitiesByType(type),
    meta: {
        type
    }
}));

const fetchAllVocabularyEntities = createErrorHandlingPromiseAction(dispatch => ({
    type: actionTypes.FETCH_ALL_VOCABULARY_ENTITIES,
    payload: dispatch(fetchMetadataVocabularyIfNeeded())
        .then(() => VocabularyAPI.getAllCatalogEntities())
}));

export const fetchVocabularyEntitiesIfNeeded = type => dispatchIfNeeded(
    () => fetchVocabularyEntitiesByType(type),
    state => (state && state.cache && state.cache.vocabularyEntitiesByType ? state.cache.vocabularyEntitiesByType[type] : undefined)
);

export const fetchAllVocabularyEntitiesIfNeeded = () => dispatchIfNeeded(
    () => fetchAllVocabularyEntities(),
    state => (state && state.cache ? state.cache.allVocabularyEntities : undefined)
);
