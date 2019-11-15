import React, {useEffect} from 'react';
import {connect} from 'react-redux';

// Actions
import {createMetadataEntity, deleteMetadataEntity, submitMetadataChanges} from "../common/redux/actions/metadataActions";
// Utils
import {getTypeInfo} from "../common/utils/linkeddata/metadataUtils";
import {getFirstPredicateValue} from "../common/utils/linkeddata/jsonLdUtils";
// Other
import LinkedDataContext, {searchLinkedData} from './LinkedDataContext';
import {METADATA_PATH, USABLE_IN_METADATA_URI} from "../constants";
import valueComponentFactory from "./common/values/LinkedDataValueComponentFactory";
import UseVocabulary from './UseVocabulary';
import UseMetadata from './UseMetadata';

const LinkedDataMetadataProvider = ({
    children, dispatchSubmitMetadataChanges, createEntity,
    getLinkedDataForSubject, dispatchDeleteEntity,
    ...otherProps
}) => {
    const {vocabulary, vocabularyLoading, vocabularyError, fetchVocabulary} = UseVocabulary();

    useEffect(() => {
        fetchVocabulary();
    }, [fetchVocabulary]);

    const {metadata, metadataLoading, metadataError, fetchMetadataBySubject} = UseMetadata();

    const createLinkedDataEntity = (subject, values, type) => createEntity(subject, values, vocabulary, type).then(({value}) => value);

    const submitLinkedDataChanges = (subject, values) => dispatchSubmitMetadataChanges(subject, values, vocabulary);

    const deleteLinkedDataEntity = subject => dispatchDeleteEntity(subject)
        .then(() => fetchMetadataBySubject(subject));

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
                getLinkedDataForSubject: () => metadata,

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
                isLinkedDataLoading: () => metadataLoading,
                hasLinkedDataErrorForSubject: () => !!metadataError,
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

const mapDispatchToProps = {
    dispatchSubmitMetadataChanges: submitMetadataChanges,
    createEntity: createMetadataEntity,
    dispatchDeleteEntity: deleteMetadataEntity,
};

export default connect(null, mapDispatchToProps)(LinkedDataMetadataProvider);
