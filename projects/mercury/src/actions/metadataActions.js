import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {MetadataAPI} from "../services/LinkedDataAPI";
import * as constants from "../constants";
import * as actionTypes from "./actionTypes";
import {createIri, getFirstPredicateId} from "../utils/metadataUtils";
import {fetchMetadataVocabularyIfNeeded} from "./vocabularyActions";

export const invalidateMetadata = subject => ({
    type: actionTypes.INVALIDATE_FETCH_METADATA,
    meta: {subject}
});

export const updateEntity = (subject, values) => ({
    type: actionTypes.UPDATE_METADATA,
    payload: MetadataAPI.updateEntity(subject, values),
    meta: {
        subject
    }
});

export const createMetadataEntity = (shape, id) => {
    const subject = createIri(id);
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

const fetchMetadataBySubject = createErrorHandlingPromiseAction(subject => ({
    type: actionTypes.FETCH_METADATA,
    payload: MetadataAPI.get({subject}),
    meta: {
        subject
    }
}));

export const fetchMetadataBySubjectIfNeeded = subject => dispatchIfNeeded(
    () => fetchMetadataBySubject(subject),
    state => (state && state.cache && state.cache.jsonLdBySubject ? state.cache.jsonLdBySubject[subject] : undefined)
);

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
        .then(() => MetadataAPI.getAllEntities())
}));

export const fetchEntitiesIfNeeded = type => dispatchIfNeeded(
    () => fetchEntitiesByType(type),
    state => (state && state.cache && state.cache.entitiesByType ? state.cache.entitiesByType[type] : undefined)
);

export const fetchAllEntitiesIfNeeded = () => dispatchIfNeeded(
    () => fetchAllEntities(),
    state => (state && state.cache ? state.cache.allEntities : undefined)
);
