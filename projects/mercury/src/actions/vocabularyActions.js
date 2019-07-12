import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {MetaVocabularyAPI, VocabularyAPI} from "../services/LinkedDataAPI";
import * as actionTypes from "./actionTypes";
import {getMetaVocabulary} from "../reducers/cache/vocabularyReducers";
import {getLinkedDataFormUpdates} from "../reducers/linkedDataFormReducers";
import {SHACL_PATH, SHACL_TARGET_CLASS, SHACL_NAMESPACE} from "../constants";
import {getFirstPredicateProperty} from "../utils/linkeddata/jsonLdUtils";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const submitVocabularyChangesFromState = (subject) => (dispatch, getState) => {
    // For vocabulary changes, the subject iri is used as form key
    const formKey = subject;

    const values = getLinkedDataFormUpdates(getState(), formKey);
    const metaVocabulary = getMetaVocabulary(getState());
    return dispatch({
        type: actionTypes.UPDATE_VOCABULARY,
        payload: VocabularyAPI.updateEntity(subject, values, metaVocabulary),
        meta: {
            subject,
            formKey
        }
    });
};

export const createVocabularyEntityFromState = (formKey, providedSubject, type) => (dispatch, getState) => {
    const values = getLinkedDataFormUpdates(getState(), formKey);
    const metaVocabulary = getMetaVocabulary(getState());

    // Infer subject from sh:targetClass or sh:path if no explicit subject is given
    const subject = providedSubject
        || getFirstPredicateProperty(values, SHACL_PATH, 'id')
        || getFirstPredicateProperty(values, SHACL_TARGET_CLASS, 'id')
        || getFirstPredicateProperty(values, SHACL_NAMESPACE, 'id');

    if (!subject) {
        return Promise.reject(new Error("Invalid metadata identifier given"));
    }

    return dispatch({
        type: actionTypes.UPDATE_VOCABULARY,
        payload: VocabularyAPI.get({subject})
            .then((meta) => {
                if (meta.length) {
                    throw Error(`Vocabulary entity already exists: ${subject}`);
                }
            })
            .then(() => VocabularyAPI.updateEntity(subject, values, metaVocabulary, type))
            .then(() => ({subject, type, values})),
        meta: {
            subject,
            type,
            formKey
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
