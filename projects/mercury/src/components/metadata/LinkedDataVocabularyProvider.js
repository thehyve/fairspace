import React from 'react';
import {connect} from 'react-redux';
// Actions
import {
    createVocabularyEntity, fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded, submitVocabularyChanges
} from "../../actions/vocabularyActions";
import {searchVocabulary} from "../../actions/searchActions";
// Reducers
import {
    getMetaVocabulary, getVocabulary, hasMetaVocabularyError, hasVocabularyError, isMetaVocabularyPending,
    isVocabularyPending
} from "../../reducers/cache/vocabularyReducers";
import {getAuthorizations} from "../../reducers/account/authorizationsReducers";
import {getVocabularySearchResults} from "../../reducers/searchReducers";
// Utils
import {isDataSteward} from "../../utils/userUtils";
import {getTypeInfo} from "../../utils/linkeddata/metadataUtils";
import {
    extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape
} from "../../utils/linkeddata/vocabularyUtils";
import {getFirstPredicateValue} from "../../utils/linkeddata/jsonLdUtils";
// Other
import LinkedDataContext from './LinkedDataContext';
import {USABLE_IN_VOCABULARY_URI, VOCABULARY_PATH} from "../../constants";
import Config from "../../services/Config/Config";
import valueComponentFactory from "./common/values/LinkedDataValueComponentFactory";

const LinkedDataVocabularyProvider = ({
    children, fetchMetaVocabulary, fetchMetadataVocabulary, submitChanges,
    metaVocabulary, vocabulary, authorizations, createEntity,
    getLinkedDataSearchResults, searchVocabularyDispatch, ...otherProps
}) => {
    fetchMetaVocabulary();
    fetchMetadataVocabulary();

    const createLinkedDataEntity = (subject, values, type) => createEntity(subject, values, metaVocabulary, type).then(({value}) => value);
    const submitLinkedDataChanges = (subject, values) => submitChanges(subject, values, metaVocabulary)
        .then(fetchMetadataVocabulary);

    const extendProperties = ({properties, isEntityEditable = true, subject}) => {
        const shape = vocabulary.get(subject);

        return extendPropertiesWithVocabularyEditingInfo({
            properties,
            isFixed: isFixedShape(shape),
            systemProperties: getSystemProperties(shape),
            isEditable: isEntityEditable && isDataSteward(authorizations, Config.get())
        });
    };

    const namespaces = vocabulary.getNamespaces(namespace => getFirstPredicateValue(namespace, USABLE_IN_VOCABULARY_URI));

    const getTypeInfoForLinkedData = (metadata) => getTypeInfo(metadata, metaVocabulary);

    const getClassesInCatalog = () => metaVocabulary.getClassesInCatalog();

    const getLinkedDataForSubject = () => vocabulary.getRaw();

    return (
        <LinkedDataContext.Provider
            value={{
                ...otherProps,

                // Backend interactions
                fetchLinkedDataForSubject: fetchMetadataVocabulary,
                searchLinkedData: searchVocabularyDispatch,
                createLinkedDataEntity,
                submitLinkedDataChanges,
                getLinkedDataForSubject,

                // Fixed properties
                namespaces,
                requireIdentifier: false,
                hasEditRight: isDataSteward(authorizations, Config.get()),
                editorPath: VOCABULARY_PATH,

                // Methods based on shapes
                getDescendants: metaVocabulary.getDescendants,
                determineShapeForTypes: metaVocabulary.determineShapeForTypes,
                getTypeInfoForLinkedData,
                getClassesInCatalog,

                // Generic methods without reference to shapes
                extendProperties,
                getSearchResults: getLinkedDataSearchResults,
                valueComponentFactory,

                shapes: metaVocabulary
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
    const getLinkedDataSearchResults = () => getVocabularySearchResults(state);

    return {
        shapesLoading,
        metaVocabulary,
        vocabulary,
        shapesError,
        authorizations,
        isLinkedDataLoading,
        hasLinkedDataErrorForSubject,
        getLinkedDataSearchResults,
    };
};

const mapDispatchToProps = {
    fetchMetaVocabulary: fetchMetaVocabularyIfNeeded,
    fetchMetadataVocabulary: fetchMetadataVocabularyIfNeeded,
    submitChanges: submitVocabularyChanges,
    createEntity: createVocabularyEntity,
    searchVocabularyDispatch: searchVocabulary,
};

export default connect(mapStateToProps, mapDispatchToProps)(LinkedDataVocabularyProvider);
