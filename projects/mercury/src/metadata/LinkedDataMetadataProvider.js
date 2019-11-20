import React, {useContext} from 'react';

// Utils
import {getTypeInfo} from "../common/utils/linkeddata/metadataUtils";
import {getFirstPredicateValue} from "../common/utils/linkeddata/jsonLdUtils";
// Other
import LinkedDataContext, {searchLinkedData} from './LinkedDataContext';
import {METADATA_PATH, USABLE_IN_METADATA_URI} from "../constants";
import valueComponentFactory from "./common/values/LinkedDataValueComponentFactory";
import VocabularyContext from './VocabularyContext';
import MetadataContext from './MetadataContext';

const LinkedDataMetadataProvider = ({children, ...otherProps}) => {
    const {vocabulary, vocabularyLoading, vocabularyError} = useContext(VocabularyContext);

    const {fetchMetadataBySubject, submitMetadataChanges, createMetadataEntity, deleteMetadataEntity} = useContext(MetadataContext);

    const createLinkedDataEntity = (subject, values, type) => createMetadataEntity(subject, values, vocabulary, type).then(({value}) => value);

    const submitLinkedDataChanges = (subject, values) => submitMetadataChanges(subject, values, vocabulary);

    const deleteLinkedDataEntity = subject => deleteMetadataEntity(subject);

    const extendProperties = ({properties, isEntityEditable = true}) => properties
        .map(p => ({
            ...p,
            isEditable: isEntityEditable && !p.machineOnly
        }));

    const namespaces = vocabulary.getNamespaces(namespace => getFirstPredicateValue(namespace, USABLE_IN_METADATA_URI));

    const getTypeInfoForLinkedData = (data) => getTypeInfo(data, vocabulary);

    const getClassesInCatalog = () => vocabulary.getClassesInCatalog();

    const shapesError = !vocabularyLoading && vocabularyError && 'An error occurred while loading the metadata';

    return (
        <LinkedDataContext.Provider
            value={{
                ...otherProps,

                // Backend interactions
                fetchLinkedDataForSubject: fetchMetadataBySubject,
                searchLinkedData,
                createLinkedDataEntity,
                deleteLinkedDataEntity,
                submitLinkedDataChanges,

                // Fixed properties
                hasEditRight: true,
                requireIdentifier: true,
                editorPath: METADATA_PATH,
                namespaces,

                // Get information from shapes
                getDescendants: vocabulary.getDescendants,
                determineShapeForTypes: vocabulary.determineShapeForTypes,
                getTypeInfoForLinkedData,
                getClassesInCatalog,

                // Generic methods without reference to shapes
                extendProperties,
                valueComponentFactory,

                shapes: vocabulary,
                shapesError,
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

export default LinkedDataMetadataProvider;
