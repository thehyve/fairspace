import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {MetadataAPI} from "../services/LinkedDataAPI";
import * as actionTypes from "./actionTypes";
import {getVocabulary} from "../reducers/cache/vocabularyReducers";
import {getLinkedDataFormUpdates} from "../reducers/linkedDataFormReducers";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const submitMetadataChangesFromState = (subject, fallbackType) => (dispatch, getState) => {
    // For metadata changes, the subject iri is used as form key
    const formKey = subject;
    const values = getLinkedDataFormUpdates(getState(), formKey);
    const vocabulary = getVocabulary(getState());
    return dispatch({
        type: actionTypes.UPDATE_METADATA,
        payload: MetadataAPI.get({subject})
            .then((meta) => (meta.length ? meta[0]['@type'][0] : fallbackType))
            .then((type) => MetadataAPI.createEntity(subject, type, values, vocabulary)),
        meta: {
            subject,
            formKey
        }
    });
};

export const createMetadataEntityFromState = (formKey, subject, type) => (dispatch, getState) => {
    const values = getLinkedDataFormUpdates(getState(), formKey);
    const vocabulary = getVocabulary(getState());

    return dispatch({
        type: actionTypes.UPDATE_METADATA,
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
            formKey,
            type
        }
    });
};

const fetchMetadataBySubject = createErrorHandlingPromiseAction(subject => ({
    type: actionTypes.FETCH_METADATA,
    payload: MetadataAPI.get({subject, includeObjectProperties: true}),
    meta: {
        subject
    }
}));

export const fetchMetadataBySubjectIfNeeded = subject => dispatchIfNeeded(
    () => fetchMetadataBySubject(subject),
    state => (state && state.cache && state.cache.jsonLdBySubject ? state.cache.jsonLdBySubject[subject] : undefined)
);
