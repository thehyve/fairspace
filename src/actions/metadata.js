import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import MetadataAPI from "../services/MetadataAPI/MetadataAPI"
import {
    METADATA,
    METADATA_ALL_ENTITIES,
    METADATA_COMBINATION,
    METADATA_ENTITIES,
    METADATA_URI_BY_PATH,
    METADATA_VOCABULARY,
    UPDATE_METADATA
} from "./actionTypes";
import * as actionTypes from "../utils/redux-action-types";

export const invalidateMetadata = (subject) => ({
    type: actionTypes.invalidate(METADATA),
    meta: {subject: subject}
})

export const updateMetadata = (subject, predicate, values) => ({
    type: UPDATE_METADATA,
    payload: MetadataAPI.update(subject, predicate, values),
    meta: {
        subject: subject,
        predicate: predicate,
        values: values
    }
})

export const fetchCombinedMetadataIfNeeded = (subject) => dispatchIfNeeded(
    () => combineMetadataForSubject(subject),
    state => state && state.metadataBySubject ? state.metadataBySubject[subject] : undefined
)

export const fetchEntitiesIfNeeded = (type) => dispatchIfNeeded(
    () => fetchEntitiesByType(type),
    state => state && state.cache && state.cache.entitiesByType ? state.cache.entitiesByType[type] : undefined
)

export const fetchAllEntitiesIfNeeded = () => dispatchIfNeeded(
    () => fetchAllEntities(),
    state => state && state.cache ? state.cache.allEntities : undefined
)


export const fetchJsonLdBySubjectIfNeeded = (subject) => dispatchIfNeeded(
    () => fetchJsonLdBySubject(subject),
    state => state && state.cache && state.cache.jsonLdBySubject ? state.cache.jsonLdBySubject[subject] : undefined
)

export const fetchMetadataVocabularyIfNeeded = () => dispatchIfNeeded(
    fetchVocabulary,
    state => state && state.cache ? state.cache.vocabulary : undefined
)


const fetchJsonLdBySubject = createErrorHandlingPromiseAction((subject) => ({
    type: METADATA,
    payload: MetadataAPI.get({subject: subject}),
    meta: {
        subject: subject
    }
}));

const combineMetadataForSubject = createErrorHandlingPromiseAction((subject, dispatch) => ({
    type: METADATA_COMBINATION,
    payload: Promise.all([
                dispatch(fetchJsonLdBySubjectIfNeeded(subject)),
                dispatch(fetchMetadataVocabularyIfNeeded())
            ]).then(([jsonLd, vocabulary]) => {
                return vocabulary.value.combine(jsonLd.value);
            }),
    meta: { subject: subject }
}))

const fetchVocabulary = createErrorHandlingPromiseAction(() => ({
    type: METADATA_VOCABULARY,
    payload: MetadataAPI.getVocabulary()
}));

const fetchEntitiesByType = createErrorHandlingPromiseAction((type) => ({
    type: METADATA_ENTITIES,
    payload: MetadataAPI.getEntitiesByType(type),
    meta: {
        type: type
    }
}));

const fetchAllEntities = createErrorHandlingPromiseAction((dispatch) => ({
    type: METADATA_ALL_ENTITIES,
    payload: dispatch(fetchMetadataVocabularyIfNeeded())
                .then(({value: vocabulary}) =>
                    MetadataAPI.getEntitiesByTypes(
                        vocabulary.getFairspaceClasses()
                            .map(entry => entry['@id'])
                    )
                )
}));

export const fetchSubjectByPathIfNeeded = (path) => dispatchIfNeeded(
    () => getUriByPath(path),
    state => state && state.cache && state.cache.subjectByPath && state.cache.subjectByPath[path]
);

const getUriByPath = createErrorHandlingPromiseAction((path) => ({
    type: METADATA_URI_BY_PATH,
    payload: MetadataAPI.getSubjectByPath(path),
    meta: { path: path }
}))
