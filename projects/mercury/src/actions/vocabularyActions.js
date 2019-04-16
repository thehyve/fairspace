import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {MetaVocabularyAPI, VocabularyAPI} from "../services/LinkedDataAPI";
import * as constants from "../constants";
import * as actionTypes from "./actionTypes";
import {createVocabularyIri, getFirstPredicateId} from "../utils/metadataUtils";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const updateVocabulary = (subject, predicate, values) => ({
    type: actionTypes.UPDATE_VOCABULARY,
    payload: VocabularyAPI.update(subject, predicate, values),
    meta: {
        subject,
        predicate,
        values
    }
});

export const createVocabularyEntity = (shape, id) => {
    const subject = createVocabularyIri(id);
    const type = getFirstPredicateId(shape, constants.SHACL_TARGET_CLASS);

    return {
        type: actionTypes.CREATE_VOCABULARY_ENTITY,
        payload: VocabularyAPI.get({subject})
            .then((meta) => {
                if (meta.length) {
                    throw Error(`Vocabulary entity already exists: ${subject}`);
                }
            })
            .then(() => VocabularyAPI.update(subject, constants.TYPE_URI, [{id: type}]))
            .then(() => subject),
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
        .then(() => VocabularyAPI.getAllEntities())
}));

export const fetchVocabularyEntitiesIfNeeded = type => dispatchIfNeeded(
    () => fetchVocabularyEntitiesByType(type),
    state => (state && state.cache && state.cache.vocabularyEntitiesByType ? state.cache.vocabularyEntitiesByType[type] : undefined)
);

export const fetchAllVocabularyEntitiesIfNeeded = () => dispatchIfNeeded(
    () => fetchAllVocabularyEntities(),
    state => (state && state.cache ? state.cache.allVocabularyEntities : undefined)
);
