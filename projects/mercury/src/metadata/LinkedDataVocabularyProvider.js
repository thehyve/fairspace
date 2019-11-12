import React, {useContext} from 'react';
import {connect} from 'react-redux';
import {UserContext} from '@fairspace/shared-frontend';

// Actions
import {
    createVocabularyEntity, deleteVocabularyEntity, fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded,
    submitVocabularyChanges
} from "../common/redux/actions/vocabularyActions";
// Reducers
import {
    getMetaVocabulary, getVocabulary, hasMetaVocabularyError, hasVocabularyError, isMetaVocabularyPending,
    isVocabularyPending
} from "../common/redux/reducers/cache/vocabularyReducers";
// Utils
import {isDataSteward} from "../common/utils/userUtils";
import {getTypeInfo} from "../common/utils/linkeddata/metadataUtils";
import {
    extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape
} from "../common/utils/linkeddata/vocabularyUtils";
import {getFirstPredicateValue} from "../common/utils/linkeddata/jsonLdUtils";
// Other
import LinkedDataContext, {searchLinkedData} from './LinkedDataContext';
import {USABLE_IN_VOCABULARY_URI, VOCABULARY_PATH} from "../constants";
import Config from "../common/services/Config";
import valueComponentFactory from "./common/values/LinkedDataValueComponentFactory";

const LinkedDataVocabularyProvider = ({
    children, fetchMetaVocabulary, fetchMetadataVocabulary, dispatchSubmitVocabularyChanges,
    metaVocabulary, vocabulary, authorizations, createEntity,
    shapesError, hasLinkedDataErrorForSubject, dispatchDeleteEntity, ...otherProps
}) => {
    if (!shapesError) {
        fetchMetaVocabulary();
    }

    if (!hasLinkedDataErrorForSubject()) {
        fetchMetadataVocabulary();
    }

    const {currentUser} = useContext(UserContext);

    const createLinkedDataEntity = (subject, values, type) => createEntity(subject, values, metaVocabulary, type).then(({value}) => value);
    const submitLinkedDataChanges = (subject, values) => dispatchSubmitVocabularyChanges(subject, values, metaVocabulary)
        .then(fetchMetadataVocabulary);

    const deleteLinkedDataEntity = subject => dispatchDeleteEntity(subject)
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
                searchLinkedData,
                createLinkedDataEntity,
                deleteLinkedDataEntity,
                submitLinkedDataChanges,
                getLinkedDataForSubject,
                hasLinkedDataErrorForSubject,

                // Fixed properties
                namespaces,
                requireIdentifier: false,
                hasEditRight: isDataSteward(currentUser.authorizations, Config.get()),
                editorPath: VOCABULARY_PATH,

                // Methods based on shapes
                getDescendants: metaVocabulary.getDescendants,
                determineShapeForTypes: metaVocabulary.determineShapeForTypes,
                getTypeInfoForLinkedData,
                getClassesInCatalog,

                shapesError,
                shapes: metaVocabulary,

                // Generic methods without reference to shapes
                extendProperties,
                valueComponentFactory,

                vocabulary
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
    const isLinkedDataLoading = () => isVocabularyPending(state);
    const hasLinkedDataErrorForSubject = () => hasVocabularyError(state);

    return {
        shapesLoading,
        metaVocabulary,
        vocabulary,
        shapesError,
        isLinkedDataLoading,
        hasLinkedDataErrorForSubject,
    };
};

const mapDispatchToProps = {
    fetchMetaVocabulary: fetchMetaVocabularyIfNeeded,
    fetchMetadataVocabulary: fetchMetadataVocabularyIfNeeded,
    dispatchSubmitVocabularyChanges: submitVocabularyChanges,
    createEntity: createVocabularyEntity,
    dispatchDeleteEntity: deleteVocabularyEntity,
};

export default connect(mapStateToProps, mapDispatchToProps)(LinkedDataVocabularyProvider);
