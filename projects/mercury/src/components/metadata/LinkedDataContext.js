import React from 'react';
import {connect} from 'react-redux';

// Actions
import {createVocabularyEntityFromState, fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded, submitVocabularyChangesFromState} from "../../actions/vocabularyActions";
import {createMetadataEntityFromState, fetchMetadataBySubjectIfNeeded, submitMetadataChangesFromState} from "../../actions/metadataActions";
import {searchVocabulary, searchMetadata} from "../../actions/searchActions";

// Reducers
import {getMetaVocabulary, getVocabulary, hasMetaVocabularyError, hasVocabularyError, isMetaVocabularyPending, isVocabularyPending} from "../../reducers/cache/vocabularyReducers";
import {getAuthorizations} from "../../reducers/account/authorizationsReducers";
import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "../../reducers/cache/jsonLdBySubjectReducers";
import {getMetadataSearchResults, getVocabularySearchResults} from "../../reducers/searchReducers";

// Utils
import {emptyLinkedData, fromJsonLd} from "../../utils/linkeddata/jsonLdConverter";
import {isDataSteward} from "../../utils/userUtils";
import {propertiesToShow, getTypeInfo, getLabel, createMetadataIri, createVocabularyIri, partitionErrors} from "../../utils/linkeddata/metadataUtils";
import {extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape} from "../../utils/linkeddata/vocabularyUtils";
import {getFirstPredicateValue, getFirstPredicateId} from "../../utils/linkeddata/jsonLdUtils";

// Other
import {USABLE_IN_VOCABULARY_URI, USABLE_IN_METADATA_URI, SHACL_TARGET_CLASS, METADATA_PATH, VOCABULARY_PATH} from "../../constants";
import BreadcrumbsContext from '../common/breadcrumbs/BreadcrumbsContext';
import Config from "../../services/Config/Config";
import Iri from "../common/Iri";
import {ErrorDialog} from "../common";
import ValidationErrorsDisplay from './common/ValidationErrorsDisplay';

const LinkedDataContext = React.createContext({});

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

    const onEntityCreationError = (e, id) => {
        if (e.details) {
            ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, createVocabularyIri(id)), e.message);
        } else {
            ErrorDialog.showError(e, `Error creating a new vocabulary entry.\n${e.message}`);
        }
    };

    return (
        <BreadcrumbsContext.Provider value={{segments: [{label: 'Vocabulary', href: '/vocabulary', icon: 'code'}]}}>
            <LinkedDataContext.Provider
                value={{
                    ...otherProps,
                    fetchLinkedDataForSubject: fetchMetadataVocabulary,
                    getEmptyLinkedData,
                    submitLinkedDataChanges,
                    createLinkedDataEntity: createVocabularyEntity,
                    getPropertiesForLinkedData,
                    namespaces,
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
                }}
            >
                {children}
            </LinkedDataContext.Provider>
        </BreadcrumbsContext.Provider>
    );
};

const LinkedDataMetadataProvider = ({
    children, fetchMetadataVocabulary, fetchMetadataBySubject, submitMetadataChanges,
    vocabulary, createMetadataEntity, getLinkedDataSearchResults, searchMetadataDispatch, ...otherProps
}) => {
    fetchMetadataVocabulary();

    const getEmptyLinkedData = (shape) => emptyLinkedData(vocabulary, shape);

    const submitLinkedDataChanges = (formKey) => submitMetadataChanges(formKey)
        .then(() => fetchMetadataBySubject(formKey));

    const getPropertiesForLinkedData = ({linkedData, isEntityEditable = true}) => propertiesToShow(linkedData)
        .map(p => ({
            ...p,
            isEditable: isEntityEditable && !p.machineOnly
        }));

    const namespaces = vocabulary.getNamespaces(namespace => getFirstPredicateValue(namespace, USABLE_IN_METADATA_URI));

    const getTypeInfoForLinkedData = (metadata) => getTypeInfo(metadata, vocabulary);

    const getClassesInCatalog = () => vocabulary.getClassesInCatalog();

    const getSearchEntities = () => {
        const {items, total, pending, error} = getLinkedDataSearchResults();

        const entities = items.map(({id, label, comment, type, highlights}) => {
            const shape = vocabulary.determineShapeForTypes(type);
            const typeLabel = getLabel(shape, true);
            const shapeUrl = shape['@id'];

            return {
                id,
                primaryText: (label && label[0]) || <Iri iri={id} />,
                secondaryText: (comment && comment[0]),
                typeLabel,
                shapeUrl,
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

    const onEntityCreationError = (e, id) => {
        if (e.details) {
            ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, createMetadataIri(id)), e.message);
        } else {
            ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`);
        }
    };

    return (
        <BreadcrumbsContext.Provider value={{segments: [{label: 'Metadata', href: '/metadata', icon: 'assignment'}]}}>
            <LinkedDataContext.Provider
                value={{
                    ...otherProps,
                    fetchLinkedDataForSubject: fetchMetadataBySubject,
                    getEmptyLinkedData,
                    submitLinkedDataChanges,
                    createLinkedDataEntity: createMetadataEntity,
                    namespaces,
                    getPropertiesForLinkedData,
                    getDescendants: vocabulary.getDescendants,
                    determineShapeForTypes: vocabulary.determineShapeForTypes,
                    hasEditRight: true,
                    getTypeInfoForLinkedData,
                    requireIdentifier: true,
                    getClassesInCatalog,
                    searchLinkedData: searchMetadataDispatch,
                    getSearchEntities,
                    getEntityRelativeUrl: (id) => `${METADATA_PATH}?iri=` + encodeURIComponent(id),
                    onEntityCreationError,
                }}
            >
                {children}
            </LinkedDataContext.Provider>
        </BreadcrumbsContext.Provider>
    );
};

const mapStateToPropsForVocabulary = (state) => {
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

const mapStateToPropsForMetadata = (state) => {
    const shapesLoading = isVocabularyPending(state);
    const vocabulary = getVocabulary(state);
    const hasShapesError = hasVocabularyError(state);
    const shapesError = !shapesLoading && hasShapesError && 'An error occurred while loading the metadata';
    const isLinkedDataLoading = (subject) => isMetadataPending(state, subject);
    const hasLinkedDataErrorForSubject = (subject) => hasMetadataError(state, subject);
    const combineLinkedDataForSubject = (subject) => getCombinedMetadataForSubject(state, subject);
    const getLinkedDataSearchResults = () => getMetadataSearchResults(state);

    return {
        shapesLoading,
        vocabulary,
        shapesError,
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
    fetchMetadataBySubject: fetchMetadataBySubjectIfNeeded,
    submitMetadataChanges: submitMetadataChangesFromState,
    createMetadataEntity: createMetadataEntityFromState,
    createVocabularyEntity: createVocabularyEntityFromState,
    searchMetadataDispatch: searchMetadata,
    searchVocabularyDispatch: searchVocabulary,
};

export const LinkedDataVocabularyProviderContainer = connect(mapStateToPropsForVocabulary, mapDispatchToProps)(LinkedDataVocabularyProvider);

export const LinkedDataMetadataProviderContainer = connect(mapStateToPropsForMetadata, mapDispatchToProps)(LinkedDataMetadataProvider);

export default LinkedDataContext;
