import React from 'react';
import {connect} from 'react-redux';
// Actions
import {fetchMetadataVocabularyIfNeeded} from "../../actions/vocabularyActions";
import {
    createMetadataEntityFromState, fetchMetadataBySubjectIfNeeded, submitMetadataChangesFromState
} from "../../actions/metadataActions";
import {searchMetadata} from "../../actions/searchActions";
// Reducers
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../reducers/cache/vocabularyReducers";
import {
    getCombinedMetadataForSubject, hasMetadataError, isMetadataPending
} from "../../reducers/cache/jsonLdBySubjectReducers";
import {getMetadataSearchResults} from "../../reducers/searchReducers";
// Utils
import {emptyLinkedData} from "../../utils/linkeddata/jsonLdConverter";
import {getTypeInfo, propertiesToShow} from "../../utils/linkeddata/metadataUtils";
import {getFirstPredicateValue} from "../../utils/linkeddata/jsonLdUtils";
// Other
import LinkedDataContext, {onEntityCreationError} from './LinkedDataContext';
import {METADATA_PATH, USABLE_IN_METADATA_URI} from "../../constants";
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

    return (
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
                getSearchResults: getLinkedDataSearchResults,
                onEntityCreationError,
                editorPath: METADATA_PATH,
                valueComponentFactory
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
