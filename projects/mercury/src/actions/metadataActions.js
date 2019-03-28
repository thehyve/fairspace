import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import MetadataAPI from "../services/MetadataAPI";
import * as constants from "../constants";
import * as actionTypes from "./actionTypes";
import {getFirstPredicateId} from "../utils/metadataUtils";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const updateMetadata = (subject, predicate, values) => ({
    type: actionTypes.UPDATE_METADATA,
    payload: MetadataAPI.update(subject, predicate, values),
    meta: {
        subject,
        predicate,
        values
    }
});

export const createMetadataEntity = (shape, id) => {
    const subject = MetadataAPI.createIri(id);
    const type = getFirstPredicateId(shape, constants.SHACL_TARGET_CLASS);
    return {
        type: actionTypes.CREATE_METADATA_ENTITY,
        payload: MetadataAPI.get({subject})
            .then((meta) => {
                if (meta.length) {
                    throw Error(`Metadata entity already exists: ${subject}`);
                }
            })
            .then(() => MetadataAPI.update(subject, constants.TYPE_URI, [{id: type}]))
            .then(() => subject),
        meta: {
            subject,
            type
        }
    };
};

const fetchJsonLdBySubject = createErrorHandlingPromiseAction(subject => ({
    type: actionTypes.FETCH_METADATA,
    payload: MetadataAPI.get({subject}),
    meta: {
        subject
    }
}));

const fetchVocabulary = createErrorHandlingPromiseAction(() => ({
    type: actionTypes.FETCH_METADATA_VOCABULARY,
    payload: MetadataAPI.getVocabulary()
}));

export const fetchMetadataVocabularyIfNeeded = () => dispatchIfNeeded(
    fetchVocabulary,
    state => (state && state.cache ? state.cache.vocabulary : undefined)
);

export const fetchJsonLdBySubjectIfNeeded = subject => dispatchIfNeeded(
    () => fetchJsonLdBySubject(subject),
    state => (state && state.cache && state.cache.jsonLdBySubject ? state.cache.jsonLdBySubject[subject] : undefined)
);

const combineMetadataForSubject = createErrorHandlingPromiseAction((subject, dispatch) => ({
    type: actionTypes.COMBINE_METADATA,
    payload: Promise.all([
        dispatch(fetchJsonLdBySubjectIfNeeded(subject)),
        dispatch(fetchMetadataVocabularyIfNeeded())
    ]).then(([jsonLd, vocabulary]) => vocabulary.value.combine(jsonLd.value, subject)),
    meta: {subject}
}));

const fetchEntitiesByType = createErrorHandlingPromiseAction(type => ({
    type: actionTypes.FETCH_METADATA_ENTITIES,
    payload: MetadataAPI.getEntitiesByType(type),
    meta: {
        type
    }
}));

const fetchAllEntities = createErrorHandlingPromiseAction(dispatch => ({
    type: actionTypes.FETCH_ALL_METADATA_ENTITIES,
    payload: dispatch(fetchMetadataVocabularyIfNeeded())
        .then(_ => MetadataAPI.getAllEntities())
}));

export const fetchCombinedMetadataIfNeeded = subject => dispatchIfNeeded(
    () => combineMetadataForSubject(subject),
    state => (state && state.metadataBySubject ? state.metadataBySubject[subject] : undefined)
);

export const fetchEntitiesIfNeeded = type => dispatchIfNeeded(
    () => fetchEntitiesByType(type),
    state => (state && state.cache && state.cache.entitiesByType ? state.cache.entitiesByType[type] : undefined)
);

export const fetchAllEntitiesIfNeeded = () => dispatchIfNeeded(
    () => fetchAllEntities(),
    state => (state && state.cache ? state.cache.allEntities : undefined)
);
