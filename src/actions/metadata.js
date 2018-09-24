import {createPromiseAction} from "../utils/redux";
import MetadataAPI from "../services/MetadataAPI/MetadataAPI"

export const invalidateMetadata = (subject) => ({
    type: "INVALIDATE_METADATA",
    subject: subject
})

export const fetchMetadataBySubjectIfNeeded = (subject) => {
    return (dispatch, getState) => {
        if (shouldFetchMetadata(getState(), subject)) {
            return dispatch(fetchMetadataBySubject(subject))
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve()
        }
    }
}

export const fetchMetadataVocabularyIfNeeded = () => {
    return (dispatch, getState) => {
        if (shouldFetchVocabulary(getState())) {
            return dispatch(fetchVocabulary())
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve()
        }
    }
}

const fetchMetadataBySubject = createPromiseAction((subject) => ({
    type: "METADATA",
    payload: MetadataAPI.get({subject: subject}),
    meta: {
        subject: subject
    }
}));

const fetchVocabulary = createPromiseAction(() => ({
    type: "METADATA_VOCABULARY",
    payload: MetadataAPI.getVocabulary()
}));

const shouldFetchMetadata = (state, subject) => {
    const metadata = state.cache.metadataBySubject[subject]
    if (!metadata) {
        return true
    } else if (metadata.pending) {
        return false
    } else {
        return metadata.didInvalidate
    }
}

const shouldFetchVocabulary = (state) => {
    const vocabulary = state.cache.vocabulary
    if (!vocabulary) {
        return true
    } else if (vocabulary.pending) {
        return false
    } else {
        return vocabulary.didInvalidate
    }
}
