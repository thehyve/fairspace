import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {MetadataAPI} from "../services/LinkedDataAPI";
import * as actionTypes from "./actionTypes";
import {getVocabulary} from "../reducers/cache/vocabularyReducers";
import {getLinkedDataFormUpdates} from "../reducers/linkedDataFormReducers";
import {getFirstPredicateValue} from "../utils/linkeddata/jsonLdUtils";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const submitMetadataChangesFromState = (subject, defaultType) => (dispatch, getState) => {
    // For metadata changes, the subject iri is used as form key
    const formKey = subject;
    const values = getLinkedDataFormUpdates(getState(), formKey);
    const vocabulary = getVocabulary(getState());
    return dispatch({
        type: actionTypes.UPDATE_METADATA,
        payload: MetadataAPI.get({subject})
            .then((meta) => (meta.length ? getFirstPredicateValue(meta[0], '@type', defaultType) : defaultType))
            .then((type) => MetadataAPI.updateEntity(subject, values, vocabulary, type)),
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
            .then(() => MetadataAPI.updateEntity(subject, values, vocabulary, type))
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
