import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {MetaVocabularyAPI, VocabularyAPI} from "../services/LinkedDataAPI";
import * as actionTypes from "./actionTypes";
import {SHACL_NAMESPACE, SHACL_PATH, SHACL_TARGET_CLASS} from "../constants";
import {getFirstPredicateProperty} from "../utils/linkeddata/jsonLdUtils";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const submitVocabularyChanges = (subject, values, metaVocabulary) => ({
    type: actionTypes.UPDATE_VOCABULARY,
    payload: VocabularyAPI.updateEntity(subject, values, metaVocabulary),
    meta: {
        subject
    }
});

export const createVocabularyEntity = (providedSubject, values, metaVocabulary, type) => {
    // Infer subject from sh:targetClass or sh:path if no explicit subject is given
    const subject = providedSubject
        || getFirstPredicateProperty(values, SHACL_PATH, 'id')
        || getFirstPredicateProperty(values, SHACL_TARGET_CLASS, 'id')
        || getFirstPredicateProperty(values, SHACL_NAMESPACE, 'id');

    if (!subject) {
        return Promise.reject(new Error("Invalid metadata identifier given"));
    }

    return {
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
            type
        }
    };
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
