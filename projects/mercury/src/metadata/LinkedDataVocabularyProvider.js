import React, {useContext, useEffect, useCallback} from 'react';
import {UserContext} from '@fairspace/shared-frontend';

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
import VocabularyContext from './VocabularyContext';
import useMetaVocabulary from './UseMetaVocabulary';

const LinkedDataVocabularyProvider = ({children, authorizations, ...otherProps}) => {
    const {metaVocabulary, shapesLoading, shapesError, fetchMetaVocabulary} = useMetaVocabulary();

    useEffect(() => {
        fetchMetaVocabulary();
    }, [fetchMetaVocabulary]);

    const {
        vocabulary, rawVocabulary, vocabularyLoading, vocabularyError, fetchVocabulary,
        submitVocabularyChanges, createVocabularyEntity, deleteVocabularyEntity
    } = useContext(VocabularyContext);

    const {currentUser} = useContext(UserContext);

    const createLinkedDataEntity = (subject, values, type) => createVocabularyEntity(subject, values, metaVocabulary, type).then(({value}) => value);

    const submitLinkedDataChanges = (subject, values) => submitVocabularyChanges(subject, values, metaVocabulary);

    const deleteLinkedDataEntity = subject => deleteVocabularyEntity(subject)
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

    const fetchLinkedDataForSubject = useCallback(() => Promise.resolve(rawVocabulary), [rawVocabulary]);

    return (
        <LinkedDataContext.Provider
            value={{
                ...otherProps,

                // Backend interactions
                fetchLinkedDataForSubject,
                searchLinkedData,
                createLinkedDataEntity,
                deleteLinkedDataEntity,
                submitLinkedDataChanges,

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

export default LinkedDataVocabularyProvider;
