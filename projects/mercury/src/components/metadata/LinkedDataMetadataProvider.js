import React from 'react';
import {connect} from 'react-redux';

// Actions
import {fetchMetadataVocabularyIfNeeded} from "../../actions/vocabularyActions";
import {createMetadataEntityFromState, fetchMetadataBySubjectIfNeeded, submitMetadataChangesFromState} from "../../actions/metadataActions";
import {searchMetadata} from "../../actions/searchActions";

// Reducers
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../reducers/cache/vocabularyReducers";
import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "../../reducers/cache/jsonLdBySubjectReducers";
import {getMetadataSearchResults} from "../../reducers/searchReducers";

// Utils
import {emptyLinkedData} from "../../utils/linkeddata/jsonLdConverter";
import {propertiesToShow, getTypeInfo, getLabel} from "../../utils/linkeddata/metadataUtils";
import {getFirstPredicateValue} from "../../utils/linkeddata/jsonLdUtils";

// Other
import LinkedDataContext, {onEntityCreationError} from './LinkedDataContext';
import {USABLE_IN_METADATA_URI, METADATA_PATH, VOCABULARY_PATH} from "../../constants";
import Iri from "../common/Iri";
import LinkedDataLink from "./common/LinkedDataLink";
import valueComponentFactory from "./common/values/LinkedDataValueComponentFactory";

const LinkedDataMetadataProvider = ({
    children, fetchMetadataVocabulary, fetchMetadataBySubject, submitMetadataChanges,
    vocabulary, createMetadataEntity, getLinkedDataSearchResults, searchMetadataDispatch, ...otherProps
}) => {
    fetchMetadataVocabulary();

    const getEmptyLinkedData = (shape) => emptyLinkedData(vocabulary, shape);

    const submitLinkedDataChanges = (formKey, type) => submitMetadataChanges(formKey, type)
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

    const typeRender = (entry) => <LinkedDataLink editorPath={VOCABULARY_PATH} uri={entry.shapeUrl}>{entry.typeLabel}</LinkedDataLink>;

    return (
        <LinkedDataContext.Provider
            value={{
                ...otherProps,

                // Backend interactions
                fetchLinkedDataForSubject: fetchMetadataBySubject,
                createLinkedDataEntity: createMetadataEntity,
                searchLinkedData: searchMetadataDispatch,
                submitLinkedDataChanges,

                // Fixed properties
                hasEditRight: true,
                requireIdentifier: true,
                editorPath: METADATA_PATH,
                namespaces,

                // Get information from shapes
                getEmptyLinkedData,
                getPropertiesForLinkedData,
                getDescendants: vocabulary.getDescendants,
                determineShapeForTypes: vocabulary.determineShapeForTypes,
                getTypeInfoForLinkedData,
                getClassesInCatalog,

                // Generic methods without reference to shapes
                valueComponentFactory,
                getSearchEntities,
                typeRender,
                onEntityCreationError
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

const mapStateToProps = (state) => {
    const shapesLoading = isVocabularyPending(state);
    const vocabulary = getVocabulary(state);
    const hasShapesError = hasVocabularyError(state);
    const shapesError = !shapesLoading && hasShapesError && 'An error occurred while loading the metadata';
    const isLinkedDataLoading = (subject) => isMetadataPending(state, subject);
    const hasLinkedDataErrorForSubject = (subject) => hasMetadataError(state, subject);
    const combineLinkedDataForSubject = (subject, defaultType) => getCombinedMetadataForSubject(state, subject, defaultType);
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
    fetchMetadataVocabulary: fetchMetadataVocabularyIfNeeded,
    fetchMetadataBySubject: fetchMetadataBySubjectIfNeeded,
    submitMetadataChanges: submitMetadataChangesFromState,
    createMetadataEntity: createMetadataEntityFromState,
    searchMetadataDispatch: searchMetadata,
};

export default connect(mapStateToProps, mapDispatchToProps)(LinkedDataMetadataProvider);
