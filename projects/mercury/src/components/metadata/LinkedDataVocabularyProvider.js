import React from 'react';
import {connect} from 'react-redux';

// Actions
import {
    createVocabularyEntityFromState, fetchMetadataVocabularyIfNeeded,
    fetchMetaVocabularyIfNeeded, submitVocabularyChangesFromState
} from "../../actions/vocabularyActions";
import {searchVocabulary} from "../../actions/searchActions";

// Reducers
import {
    getMetaVocabulary, getVocabulary, hasMetaVocabularyError,
    hasVocabularyError, isMetaVocabularyPending, isVocabularyPending
} from "../../reducers/cache/vocabularyReducers";
import {getAuthorizations} from "../../reducers/account/authorizationsReducers";
import {getVocabularySearchResults} from "../../reducers/searchReducers";

// Utils
import {emptyLinkedData, fromJsonLd} from "../../utils/linkeddata/jsonLdConverter";
import {isDataSteward} from "../../utils/userUtils";
import {propertiesToShow, getTypeInfo, getLabel} from "../../utils/linkeddata/metadataUtils";
import {extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape} from "../../utils/linkeddata/vocabularyUtils";
import {getFirstPredicateValue, getFirstPredicateId} from "../../utils/linkeddata/jsonLdUtils";

// Other
import LinkedDataContext, {onEntityCreationError} from './LinkedDataContext';
import {USABLE_IN_VOCABULARY_URI, SHACL_TARGET_CLASS, VOCABULARY_PATH} from "../../constants";
import Config from "../../services/Config/Config";
import valueComponentFactory from "./common/values/LinkedDataValueComponentFactory";

const LinkedDataVocabularyProvider = ({
    children, fetchMetaVocabulary, fetchMetadataVocabulary, submitVocabularyChanges,
    metaVocabulary, vocabulary, authorizations, createVocabularyEntity,
    getLinkedDataSearchResults, searchVocabularyDispatch, ...otherProps
}) => {
    fetchMetaVocabulary();

    const getEmptyLinkedData = (shape) => emptyLinkedData(metaVocabulary, shape);

    const submitLinkedDataChanges = (formKey) => submitVocabularyChanges(formKey)
        .then(() => fetchMetadataVocabulary());

    const getPropertiesForLinkedData = ({linkedData, subject, isEntityEditable = true}) => {
        const shape = vocabulary.get(subject);

        return extendPropertiesWithVocabularyEditingInfo({
            properties: propertiesToShow(linkedData),
            isFixed: isFixedShape(shape),
            systemProperties: getSystemProperties(shape),
            isEditable: isEntityEditable && isDataSteward(authorizations, Config.get())
        });
    };

    const namespaces = vocabulary.getNamespaces(namespace => getFirstPredicateValue(namespace, USABLE_IN_VOCABULARY_URI));

    const getTypeInfoForLinkedData = (metadata) => getTypeInfo(metadata, metaVocabulary);

    const getClassesInCatalog = () => metaVocabulary.getClassesInCatalog();

    const getSearchEntities = () => {
        const {items, pending, error, total} = getLinkedDataSearchResults();

        const entities = items.map(({id, name, description, type, highlights}) => {
            const shape = metaVocabulary.determineShapeForTypes(type) || {};
            const typeLabel = getLabel(shape, true);
            const typeUrl = getFirstPredicateId(shape, SHACL_TARGET_CLASS);

            return {
                id,
                primaryText: name,
                secondaryText: description,
                typeLabel,
                typeUrl,
                highlights
            };
        });

        return {
            searchPending: pending,
            searchError: error,
            entities,
            total,
            hasHighlights: entities.some(({highlights}) => highlights.length > 0),
        };
    };

    const typeRender = (entry) => <a href={entry.typeUrl}> {entry.typeLabel} </a>;

    return (
        <LinkedDataContext.Provider
            value={{
                ...otherProps,
                fetchLinkedDataForSubject: fetchMetadataVocabulary,
                getEmptyLinkedData,
                submitLinkedDataChanges,
                createLinkedDataEntity: createVocabularyEntity,
                namespaces,
                getPropertiesForLinkedData,
                getDescendants: metaVocabulary.getDescendants,
                determineShapeForTypes: metaVocabulary.determineShapeForTypes,
                hasEditRight: isDataSteward(authorizations, Config.get()),
                getTypeInfoForLinkedData,
                requireIdentifier: false,
                getClassesInCatalog,
                searchLinkedData: searchVocabularyDispatch,
                getSearchEntities,
                getEntityRelativeUrl: (id) => `${VOCABULARY_PATH}?iri=` + encodeURIComponent(id),
                onEntityCreationError,
                typeRender,
                editorPath: VOCABULARY_PATH,
                valueComponentFactory
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

const mapStateToProps = (state) => {
    const shapesLoading = isMetaVocabularyPending(state);
    const hasShapesError = hasMetaVocabularyError(state);
    const metaVocabulary = getMetaVocabulary(state);
    const vocabulary = getVocabulary(state);
    const shapesError = !shapesLoading && hasShapesError && 'An error occurred while loading the vocbulary';
    const authorizations = getAuthorizations(state);
    const isLinkedDataLoading = () => isVocabularyPending(state);
    const hasLinkedDataErrorForSubject = () => hasVocabularyError(state);
    const combineLinkedDataForSubject = (subject) => fromJsonLd(vocabulary.getRaw(), subject, metaVocabulary);
    const getLinkedDataSearchResults = () => getVocabularySearchResults(state);

    return {
        shapesLoading,
        metaVocabulary,
        vocabulary,
        shapesError,
        authorizations,
        isLinkedDataLoading,
        hasLinkedDataErrorForSubject,
        combineLinkedDataForSubject,
        getLinkedDataSearchResults,
    };
};

const mapDispatchToProps = {
    fetchMetaVocabulary: fetchMetaVocabularyIfNeeded,
    fetchMetadataVocabulary: fetchMetadataVocabularyIfNeeded,
    submitVocabularyChanges: submitVocabularyChangesFromState,
    createVocabularyEntity: createVocabularyEntityFromState,
    searchVocabularyDispatch: searchVocabulary,
};

export default connect(mapStateToProps, mapDispatchToProps)(LinkedDataVocabularyProvider);
