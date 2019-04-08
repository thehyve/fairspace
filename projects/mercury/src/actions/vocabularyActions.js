import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import MetadataAPI from "../services/MetadataAPI";
import * as constants from "../constants";
import * as actionTypes from "./actionTypes";
import {createIri, getFirstPredicateId} from "../utils/metadataUtils";
import {getVocabulary} from "../selectors/vocabularySelectors";

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

export const createMetadataEntity = (shape, id) => {
    const subject = createIri(id);
    const type = getFirstPredicateId(shape, constants.SHACL_TARGET_CLASS);
    return {
        type: actionTypes.CREATE_METADATA_ENTITY,
        payload: MetadataAPI.metadata.get({subject})
            .then((meta) => {
                if (meta.length) {
                    throw Error(`Metadata entity already exists: ${subject}`);
                }
            })
            .then(() => MetadataAPI.metadata.update(subject, constants.TYPE_URI, [{id: type}]))
            .then(() => subject),
        meta: {
            subject,
            type
        }
    };
};


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


const fetchMetadataBySubject = createErrorHandlingPromiseAction(subject => ({
    type: actionTypes.FETCH_METADATA,
    payload: MetadataAPI.metadata.get({subject}),
    meta: {
        subject
    }
}));

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

export const fetchMetadataBySubjectIfNeeded = subject => dispatchIfNeeded(
    () => fetchMetadataBySubject(subject),
    state => (state && state.cache && state.cache.jsonLdBySubject ? state.cache.jsonLdBySubject[subject] : undefined)
);

const fetchEntitiesByType = createErrorHandlingPromiseAction(type => ({
    type: actionTypes.FETCH_METADATA_ENTITIES,
    payload: MetadataAPI.metadata.getEntitiesByType(type),
    meta: {
        type
    }
}));

const fetchAllEntities = createErrorHandlingPromiseAction(dispatch => ({
    type: actionTypes.FETCH_ALL_METADATA_ENTITIES,
    payload: dispatch(fetchMetadataVocabularyIfNeeded())
        .then(_ => MetadataAPI.metadata.getAllEntities())
}));

export const fetchEntitiesIfNeeded = type => dispatchIfNeeded(
    () => fetchEntitiesByType(type),
    state => (state && state.cache && state.cache.entitiesByType ? state.cache.entitiesByType[type] : undefined)
);

export const fetchAllEntitiesIfNeeded = () => dispatchIfNeeded(
    () => fetchAllEntities(),
    state => (state && state.cache ? state.cache.allEntities : undefined)
);
