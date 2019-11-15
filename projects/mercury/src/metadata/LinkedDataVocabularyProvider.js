import React, {useContext, useEffect} from 'react';
import {connect} from 'react-redux';
import {UserContext} from '@fairspace/shared-frontend';

// Actions
import {createVocabularyEntity, deleteVocabularyEntity, submitVocabularyChanges} from "../common/redux/actions/vocabularyActions";
// Utils
import {isDataSteward} from "../common/utils/userUtils";
import {getTypeInfo} from "../common/utils/linkeddata/metadataUtils";
import {extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape} from "../common/utils/linkeddata/vocabularyUtils";
import {getFirstPredicateValue} from "../common/utils/linkeddata/jsonLdUtils";
// Other
import LinkedDataContext, {searchLinkedData} from './LinkedDataContext';
import {USABLE_IN_VOCABULARY_URI, VOCABULARY_PATH} from "../constants";
import Config from "../common/services/Config";
import valueComponentFactory from "./common/values/LinkedDataValueComponentFactory";
import useVocabulary from './UseVocabulary';
import UseMetaVocabulary from './UseMetaVocabulary';

const LinkedDataVocabularyProvider = ({
    children, dispatchSubmitVocabularyChanges,
    authorizations, createEntity, dispatchDeleteEntity, ...otherProps
}) => {
    const {metaVocabulary, shapesLoading, shapesError, fetchMetaVocabulary} = UseMetaVocabulary();

    useEffect(() => {
        fetchMetaVocabulary();
    }, [fetchMetaVocabulary]);

    const {vocabulary, vocabularyLoading, vocabularyError, fetchVocabulary} = useVocabulary();

    const {currentUser} = useContext(UserContext);

    const createLinkedDataEntity = (subject, values, type) => createEntity(subject, values, metaVocabulary, type).then(({value}) => value);

    const submitLinkedDataChanges = (subject, values) => dispatchSubmitVocabularyChanges(subject, values, metaVocabulary);

    const deleteLinkedDataEntity = subject => dispatchDeleteEntity(subject)
        .then(fetchVocabulary);

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
                fetchLinkedDataForSubject: fetchVocabulary,
                searchLinkedData,
                createLinkedDataEntity,
                deleteLinkedDataEntity,
                submitLinkedDataChanges,
                getLinkedDataForSubject,

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

                shapesLoading,
                shapesError,
                shapes: metaVocabulary,

                // Generic methods without reference to shapes
                extendProperties,
                valueComponentFactory,

                vocabulary,
                isLinkedDataLoading: () => vocabularyLoading,
                hasLinkedDataErrorForSubject: () => !!vocabularyError,
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

const mapDispatchToProps = {
    dispatchSubmitVocabularyChanges: submitVocabularyChanges,
    createEntity: createVocabularyEntity,
    dispatchDeleteEntity: deleteVocabularyEntity,
};

export default connect(null, mapDispatchToProps)(LinkedDataVocabularyProvider);
