import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {MetadataAPI} from "../services/LinkedDataAPI";
import * as actionTypes from "./actionTypes";
import {getFirstPredicateValue} from "../utils/linkeddata/jsonLdUtils";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const submitMetadataChanges = (subject, values, vocabulary, defaultType) => ({
    type: actionTypes.UPDATE_METADATA,
    payload: MetadataAPI.get({subject})
        .then(meta => (meta.length ? getFirstPredicateValue(meta[0], '@type', defaultType) : defaultType))
        .then(type => MetadataAPI.updateEntity(subject, values, vocabulary, type)),
    meta: {
        subject
    }
});

export const createMetadataEntity = (subject, values, vocabulary, type) => ({
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
        type
    }
});

export const deleteMetadataEntity = (subject) => ({
    type: actionTypes.DELETE_METADATA,
    payload: MetadataAPI.delete(subject),
    meta: {
        subject
    }
});

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
