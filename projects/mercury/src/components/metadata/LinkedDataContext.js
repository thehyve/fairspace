import React from 'react';
import {connect} from 'react-redux';

import {fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded, submitVocabularyChangesFromState} from "../../actions/vocabularyActions";
import {fetchMetadataBySubjectIfNeeded, submitMetadataChangesFromState} from "../../actions/metadataActions";
import {
    getVocabulary, hasVocabularyError, isVocabularyPending,
    isMetaVocabularyPending, getMetaVocabulary, hasMetaVocabularyError
} from "../../reducers/cache/vocabularyReducers";
import {getAuthorizations} from "../../reducers/account/authorizationsReducers";
import {fromJsonLd, emptyLinkedData} from "../../utils/linkeddata/jsonLdConverter";
import {getCombinedMetadataForSubject, hasMetadataError, isMetadataPending} from "../../reducers/cache/jsonLdBySubjectReducers";
import {isDataSteward} from "../../utils/userUtils";
import Config from "../../services/Config/Config";
import {propertiesToShow, getTypeInfo} from "../../utils/linkeddata/metadataUtils";
import {extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape} from "../../utils/linkeddata/vocabularyUtils";

const LinkedDataContext = React.createContext({});

const LinkedDataVocabularyProvider = ({
    children, fetchMetaVocabulary, fetchMetadataVocabulary, submitVocabularyChanges,
    shapesLoading, metaVocabulary, vocabulary, shapesError,
    authorizations, isLinkedDataLoading, hasLinkedDataErrorForSubject, combineLinkedDataForSubject,
}) => {
    fetchMetaVocabulary();

    const getEmptyLinkedData = (shape) => emptyLinkedData(metaVocabulary, shape);

    const submitLinkedDataChanges = (formKey) => submitVocabularyChanges(formKey)
        .then(() => fetchMetadataVocabulary());

    const getPropertiesForLinkedData = (linkedData, subject) => {
        const shape = vocabulary.get(subject);

        return extendPropertiesWithVocabularyEditingInfo({
            properties: propertiesToShow(linkedData),
            isFixed: isFixedShape(shape),
            systemProperties: getSystemProperties(shape),
            isEditable: isDataSteward
        });
    };

    const getTypeInfoForLinkedData = (metadata) => getTypeInfo(metadata, metaVocabulary);

    return (
        <LinkedDataContext.Provider
            value={{
                shapesLoading,
                shapesError,
                fetchLinkedDataForSubject: fetchMetadataVocabulary,
                isLinkedDataLoading,
                hasLinkedDataErrorForSubject,
                combineLinkedDataForSubject,
                getEmptyLinkedData,
                submitLinkedDataChanges,
                getPropertiesForLinkedData,
                hasEditRight: isDataSteward(authorizations, Config.get()),
                getTypeInfoForLinkedData
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};


const LinkedDataMetadataProvider = ({
    children, fetchMetadataVocabulary, fetchMetadataBySubject,
    submitMetadataChanges, shapesLoading, vocabulary,
    shapesError, isLinkedDataLoading, hasLinkedDataErrorForSubject,
    combineLinkedDataForSubject,
}) => {
    fetchMetadataVocabulary();

    const getEmptyLinkedData = (shape) => emptyLinkedData(vocabulary, shape);

    const submitLinkedDataChanges = (formKey) => submitMetadataChanges(formKey)
        .then(() => fetchMetadataBySubject(formKey));

    const getPropertiesForLinkedData = (linkedData) => propertiesToShow(linkedData)
        .map(p => ({
            ...p,
            isEditable: !p.machineOnly
        }));

    const getTypeInfoForLinkedData = (metadata) => getTypeInfo(metadata, vocabulary);

    return (
        <LinkedDataContext.Provider
            value={{
                shapesLoading,
                shapesError,
                fetchLinkedDataForSubject: fetchMetadataBySubject,
                isLinkedDataLoading,
                hasLinkedDataErrorForSubject,
                combineLinkedDataForSubject,
                getEmptyLinkedData,
                submitLinkedDataChanges,
                getPropertiesForLinkedData,
                hasEditRight: true,
                getTypeInfoForLinkedData
            }}
        >
            {children}
        </LinkedDataContext.Provider>
    );
};

const mapStateToPropsForVocabulary = (state) => {
    const shapesLoading = isMetaVocabularyPending(state);
    const hasShapesError = hasMetaVocabularyError(state);
    const metaVocabulary = getMetaVocabulary(state);
    const vocabulary = getVocabulary(state);
    const shapesError = !shapesLoading && hasShapesError && 'An error occurred while loading the vocbulary';
    const authorizations = getAuthorizations(state);
    const isLinkedDataLoading = () => isVocabularyPending(state);
    const hasLinkedDataErrorForSubject = () => hasVocabularyError(state);
    const combineLinkedDataForSubject = (subject) => fromJsonLd(vocabulary.getRaw(), subject, metaVocabulary);

    return {
        shapesLoading,
        metaVocabulary,
        vocabulary,
        shapesError,
        authorizations,
        isLinkedDataLoading,
        hasLinkedDataErrorForSubject,
        combineLinkedDataForSubject,
    };
};

const mapStateToPropsForMetadata = (state) => {
    const shapesLoading = isVocabularyPending(state);
    const vocabulary = getVocabulary(state);
    const hasShapesError = hasVocabularyError(state);
    const shapesError = !shapesLoading && hasShapesError && 'An error occurred while loading the metadata';
    const isLinkedDataLoading = (subject) => isMetadataPending(state, subject);
    const hasLinkedDataErrorForSubject = (subject) => hasMetadataError(state, subject);
    const combineLinkedDataForSubject = (subject) => getCombinedMetadataForSubject(state, subject);

    return {
        shapesLoading,
        vocabulary,
        shapesError,
        isLinkedDataLoading,
        hasLinkedDataErrorForSubject,
        combineLinkedDataForSubject,
    };
};


const mapDispatchToProps = {
    fetchMetaVocabulary: fetchMetaVocabularyIfNeeded,
    fetchMetadataVocabulary: fetchMetadataVocabularyIfNeeded,
    submitVocabularyChanges: submitVocabularyChangesFromState,
    fetchMetadataBySubject: fetchMetadataBySubjectIfNeeded,
    submitMetadataChanges: submitMetadataChangesFromState
};

export const LinkedDataVocabularyProviderContainer = connect(mapStateToPropsForVocabulary, mapDispatchToProps)(LinkedDataVocabularyProvider);

export const LinkedDataMetadataProviderContainer = connect(mapStateToPropsForMetadata, mapDispatchToProps)(LinkedDataMetadataProvider);

export default LinkedDataContext;
