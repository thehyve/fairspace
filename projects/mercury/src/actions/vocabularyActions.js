import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import MetadataAPI from "../services/MetadataAPI";
import * as constants from "../constants";
import * as actionTypes from "./actionTypes";
import {createIri, getFirstPredicateId} from "../utils/metadataUtils";
import {getVocabulary} from "../reducers/cache/vocabularyReducers";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const updateMetadata = (subject, predicate, values) => ({
    type: actionTypes.UPDATE_METADATA,
    payload: MetadataAPI.metadata.update(subject, predicate, values),
    meta: {
        subject,
        predicate,
        values
    }
});

export const createVocabularyEntity = (shape, id) => {
    const subject = createIri(id);
    const type = getFirstPredicateId(shape, constants.SHACL_TARGET_CLASS);

    if (getVocabulary().contains(id)) {
        throw Error(`Vocabulary entity already exists: ${subject}`);
    }

    return {
        type: actionTypes.CREATE_VOCABULARY_ENTITY,
        payload: MetadataAPI.vocabulary.update(subject, constants.TYPE_URI, [{id: type}])
            .then(() => subject),
        meta: {
            subject,
            type
        }
    };
};

const fetchVocabulary = createErrorHandlingPromiseAction(() => ({
    type: actionTypes.FETCH_METADATA_VOCABULARY,
    payload: MetadataAPI.vocabulary.get()
}));

export const fetchMetadataVocabularyIfNeeded = () => dispatchIfNeeded(
    fetchVocabulary,
    state => (state && state.cache ? state.cache.vocabulary : undefined)
);

const fetchMetaVocabulary = createErrorHandlingPromiseAction(() => ({
    type: actionTypes.FETCH_META_VOCABULARY,
    payload: MetadataAPI.metaVocabulary.get()
}));

export const fetchMetaVocabularyIfNeeded = () => dispatchIfNeeded(
    fetchMetaVocabulary,
    state => (state && state.cache ? state.cache.metaVocabulary : undefined)
);

const fetchVocabularyEntitiesByType = createErrorHandlingPromiseAction(type => ({
    type: actionTypes.FETCH_VOCABULARY_ENTITIES,
    payload: MetadataAPI.vocabulary.getEntitiesByType(type),
    meta: {
        type
    }
}));

const fetchAllVocabularyEntities = createErrorHandlingPromiseAction(dispatch => ({
    type: actionTypes.FETCH_ALL_VOCABULARY_ENTITIES,
    payload: dispatch(fetchMetadataVocabularyIfNeeded())
        .then(_ => MetadataAPI.vocabulary.getAllEntities())
}));

export const fetchVocabularyEntitiesIfNeeded = type => dispatchIfNeeded(
    () => fetchVocabularyEntitiesByType(type),
    state => (state && state.cache && state.cache.vocabularyEntitiesByType ? state.cache.vocabularyEntitiesByType[type] : undefined)
);

export const fetchAllVocabularyEntitiesIfNeeded = () => dispatchIfNeeded(
    () => fetchAllVocabularyEntities(),
    state => (state && state.cache ? state.cache.allVocabularyEntities : undefined)
);
