import React, {useContext, useEffect, useCallback} from 'react';
import {UserContext} from '@fairspace/shared-frontend';

// Utils
import {isDataSteward} from "../common/utils/userUtils";
import {extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape, get, getNamespaces} from "../common/utils/linkeddata/vocabularyUtils";
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
        vocabulary, fetchVocabulary, submitVocabularyChanges, createVocabularyEntity, deleteVocabularyEntity
    } = useContext(VocabularyContext);

    const {currentUser} = useContext(UserContext);

    const createLinkedDataEntity = (subject, values, type) => createVocabularyEntity(subject, values, metaVocabulary, type);

    const submitLinkedDataChanges = (subject, values) => submitVocabularyChanges(subject, values, metaVocabulary)
        .then(fetchVocabulary);

    const deleteLinkedDataEntity = subject => deleteVocabularyEntity(subject)
        .then(fetchVocabulary);

    const extendProperties = ({properties, isEntityEditable = true, subject}) => {
        const shape = get(vocabulary, subject);

        return extendPropertiesWithVocabularyEditingInfo({
            properties,
            isFixed: isFixedShape(shape),
            systemProperties: getSystemProperties(shape),
            isEditable: isEntityEditable && isDataSteward(authorizations, Config.get())
        });
    };

    const namespaces = getNamespaces(vocabulary, namespace => getFirstPredicateValue(namespace, USABLE_IN_VOCABULARY_URI));

    const fetchLinkedDataForSubject = useCallback(() => Promise.resolve(vocabulary), [vocabulary]);

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

                shapesLoading,
                shapesError,
                shapes: metaVocabulary,

                // Generic methods without reference to shapes
                extendProperties,
                valueComponentFactory,

                vocabulary,
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

export default LinkedDataVocabularyProvider;
