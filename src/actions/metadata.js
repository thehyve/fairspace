import {createErrorHandlingPromiseAction} from "../utils/redux";
import MetadataAPI from "../services/MetadataAPI/MetadataAPI"

export const invalidateMetadata = (subject) => ({
    type: "INVALIDATE_METADATA",
    meta: {subject: subject}
})

export const updateMetadata = (subject, predicate, values) => ({
    type: "UPDATE_METADATA",
    payload: MetadataAPI.update(subject, predicate, values),
    meta: {
        subject: subject,
        predicate: predicate,
        values: values
    }
})

export const fetchCombinedMetadataIfNeeded = (subject) => {
    return (dispatch, getState) => {
        if (shouldCombineMetadata(getState(), subject)) {
            return dispatch(combineMetadataForSubject(subject))
        } else {
            return Promise.resolve();
        }
    }
}

export const fetchEntitiesIfNeeded = (type) => {
    return (dispatch, getState) => {
        if (shouldFetchEntities(getState(), type)) {
            return dispatch(fetchEntitiesByType(type))
        } else {
            return Promise.resolve();
        }
    }
}

export const fetchJsonLdBySubjectIfNeeded = (subject) => {
    return (dispatch, getState) => {
        const state = getState();
        if (shouldFetchMetadata(state, subject)) {
            return dispatch(fetchJsonLdBySubject(subject))
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve({value: state.cache.jsonLdBySubject[subject].items})
        }
    }
}

const fetchMetadataVocabularyIfNeeded = () => {
    return (dispatch, getState) => {
        const state = getState();
        if (shouldFetchVocabulary(state)) {
            return dispatch(fetchVocabulary())
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve({value: state.cache.vocabulary.item})
        }
    }
}

const fetchJsonLdBySubject = createErrorHandlingPromiseAction((subject) => ({
    type: "METADATA",
    payload: MetadataAPI.get({subject: subject}),
    meta: {
        subject: subject
    }
}));

const combineMetadataForSubject = createErrorHandlingPromiseAction((subject, dispatch) => ({
    type: "METADATA_COMBINATION",
    payload: Promise.all([
                dispatch(fetchJsonLdBySubjectIfNeeded(subject)),
                dispatch(fetchMetadataVocabularyIfNeeded())
            ]).then(([jsonLd, vocabulary]) => {
                return vocabulary.value.combine(jsonLd.value);
            }),
    meta: { subject: subject }
}))

const fetchVocabulary = createErrorHandlingPromiseAction(() => ({
    type: "METADATA_VOCABULARY",
    payload: MetadataAPI.getVocabulary()
}));

const fetchEntitiesByType = createErrorHandlingPromiseAction((type) => ({
    type: "METADATA_ENTITIES",
    payload: MetadataAPI.getEntitiesByType(type),
    meta: {
        type: type
    }
}));

const shouldFetchMetadata = (state, subject) => {
    const metadata = state && state.cache && state.cache.jsonLdBySubject ? state.cache.jsonLdBySubject[subject] : undefined;
    if (!metadata) {
        return true
    } else if (metadata.pending) {
        return false
    } else {
        return metadata.invalidated
    }
}

const shouldCombineMetadata = (state, subject) => {
    return !state || !state.metadataBySubject || !state.metadataBySubject[subject];
}

const shouldFetchVocabulary = (state) => {
    const vocabulary = state && state.cache ? state.cache.vocabulary : undefined
    if (!vocabulary) {
        return true
    } else if (vocabulary.pending) {
        return false
    } else {
        return vocabulary.invalidated
    }
}

const shouldFetchEntities = (state, type) => {
    const entities = state && state.cache && state.cache.entitiesByType ? state.cache.entitiesByType[type] : undefined;
    if (!entities) {
        return true
    } else if (entities.pending) {
        return false
    } else {
        return entities.invalidated
    }
}
