import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {MetadataAPI} from "../services/LinkedDataAPI";
import * as actionTypes from "./actionTypes";
import {fetchMetadataVocabularyIfNeeded} from "./vocabularyActions";
import {getMetadataFormUpdates} from "../reducers/metadataFormReducers";
import {getVocabulary} from "../reducers/cache/vocabularyReducers";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const updateEntity = (subject, values, vocabulary) => ({
    type: actionTypes.UPDATE_METADATA,
    payload: MetadataAPI.updateEntity(subject, values, vocabulary),
    meta: {
        subject
    }
});

export const submitMetadataChangesFromState = (subject) => (dispatch, getState) => {
    const updates = getMetadataFormUpdates(getState(), subject);
    const vocabulary = getVocabulary(getState());
    return dispatch(updateEntity(subject, updates, vocabulary));
};

export const createEntity = (subject, type, values, vocabulary) => ({
    type: actionTypes.CREATE_METADATA_ENTITY,
    payload: MetadataAPI.get({subject})
        .then((meta) => {
            if (meta.length) {
                throw Error(`Entity already exists: ${subject}`);
            }
        })
        .then(() => MetadataAPI.createEntity(subject, type, values, vocabulary))
        .then(() => ({subject, type, values})),
    meta: {
        subject,
        type
    }
});

export const createMetadataEntityFromState = (subject, type) => (dispatch, getState) => {
    const values = getMetadataFormUpdates(getState(), subject);
    const vocabulary = getVocabulary(getState());

    return dispatch(createEntity(subject, type, values, vocabulary));
};

const fetchMetadataBySubject = createErrorHandlingPromiseAction(subject => ({
    type: actionTypes.FETCH_METADATA,
    payload: MetadataAPI.get({subject}),
    meta: {
        subject
    }
}));

export const fetchMetadataBySubjectIfNeeded = subject => dispatchIfNeeded(
    () => fetchMetadataBySubject(subject),
    state => (state && state.cache && state.cache.jsonLdBySubject ? state.cache.jsonLdBySubject[subject] : undefined)
);

const fetchEntitiesByType = createErrorHandlingPromiseAction(type => ({
    type: actionTypes.FETCH_METADATA_ENTITIES,
    payload: MetadataAPI.getEntitiesByType(type),
    meta: {
        type
    }
}));

const fetchAllEntities = createErrorHandlingPromiseAction(dispatch => ({
    type: actionTypes.FETCH_ALL_METADATA_ENTITIES,
    payload: dispatch(fetchMetadataVocabularyIfNeeded())
        .then(() => MetadataAPI.getAllEntities())
}));

export const fetchEntitiesIfNeeded = type => dispatchIfNeeded(
    () => fetchEntitiesByType(type),
    state => (state && state.cache && state.cache.entitiesByType ? state.cache.entitiesByType[type] : undefined)
);

export const fetchAllEntitiesIfNeeded = () => dispatchIfNeeded(
    () => fetchAllEntities(),
    state => (state && state.cache ? state.cache.allEntities : undefined)
);
