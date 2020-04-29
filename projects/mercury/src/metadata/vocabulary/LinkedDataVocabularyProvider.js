import React, {useCallback, useContext} from 'react';
// Utils
import {isDataSteward} from "../../users/userUtils";
import {
    extendPropertiesWithVocabularyEditingInfo,
    getNamespaces,
    getShape,
    getSystemProperties,
    isFixedShape
} from "../common/vocabularyUtils";
import {getFirstPredicateValue} from "../common/jsonLdUtils";
// Other
import LinkedDataContext, {searchLinkedData} from '../LinkedDataContext';
import {USABLE_IN_VOCABULARY_URI, VOCABULARY_PATH} from "../../constants";
import valueComponentFactory from "../common/values/LinkedDataValueComponentFactory";
import VocabularyContext from './VocabularyContext';
import useAsync from "../../common/hooks/UseAsync";
import {MetaVocabularyAPI} from "../common/LinkedDataAPI";
import UserContext from "../../users/UserContext";

const LinkedDataVocabularyProvider = ({children, authorizations, ...otherProps}) => {
    const {data: metaVocabulary = [], loading: shapesLoading, error: shapesError} = useAsync(() => MetaVocabularyAPI.get(), []);

    const {
        vocabulary, fetchVocabulary, submitVocabularyChanges, createVocabularyEntity, deleteVocabularyEntity
    } = useContext(VocabularyContext);

    const {currentUser} = useContext(UserContext);

    const canEdit = isDataSteward(currentUser);

    const createLinkedDataEntity = (subject, values, type) => createVocabularyEntity(subject, values, metaVocabulary, type);

    const submitLinkedDataChanges = (subject, values) => submitVocabularyChanges(subject, values, metaVocabulary)
        .then(fetchVocabulary);

    const deleteLinkedDataEntity = subject => deleteVocabularyEntity(subject)
        .then(fetchVocabulary);

    const extendProperties = ({properties, isEntityEditable = true, subject}) => {
        const shape = getShape(vocabulary, subject);

        return extendPropertiesWithVocabularyEditingInfo({
            properties,
            isFixed: isFixedShape(shape),
            systemProperties: getSystemProperties(shape),
            isEditable: isEntityEditable && canEdit
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
                hasEditRight: canEdit,
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
