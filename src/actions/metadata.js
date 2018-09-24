import {createPromiseAction} from "../utils/redux";
import MetadataAPI from "../services/MetadataAPI/MetadataAPI"

export const invalidateMetadata = (subject) => ({
    type: "INVALIDATE_METADATA",
    subject: subject
})

export const updateMetadata = createPromiseAction((subject, predicate, values) => ({
    type: "UPDATE_METADATA",
    payload: this.props.metadataAPI
        .update(subject, predicate, values),
    meta: {
        subject: subject,
        predicate: predicate
    }
}))

export const fetchCombinedMetadataIfNeeded = (subject) => {
    return (dispatch, getState) => {
        if (shouldCombineMetadata(getState(), subject)) {
            return dispatch(combineMetadataForSubject(subject))
        } else {
            return Promise.resolve();
        }
    }
}

const fetchJsonLdBySubjectIfNeeded = (subject) => {
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

const fetchJsonLdBySubject = createPromiseAction((subject) => ({
    type: "METADATA",
    payload: MetadataAPI.get({subject: subject}),
    meta: {
        subject: subject
    }
}));

const combineMetadataForSubject = createPromiseAction((subject, dispatch) => ({
    type: "METADATA_COMBINATION",
    payload: Promise.all([
                dispatch(fetchJsonLdBySubjectIfNeeded(subject)),
                dispatch(fetchMetadataVocabularyIfNeeded())
            ]).then(([jsonLd, vocabulary]) => {
                return vocabulary.value.combine(jsonLd.value);
            }),
    meta: { subject: subject }
}))

const fetchVocabulary = createPromiseAction(() => ({
    type: "METADATA_VOCABULARY",
    payload: MetadataAPI.getVocabulary()
}));

const shouldFetchMetadata = (state, subject) => {
    const metadata = state && state.cache && state.cache.jsonLdBySubject ? state.cache.jsonLdBySubject[subject] : undefined;
    if (!metadata) {
        return true
    } else if (metadata.pending) {
        return false
    } else {
        return !!metadata.error
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
        return !!vocabulary.error
    }
}
