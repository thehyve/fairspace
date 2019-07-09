import React from 'react';
import {connect} from 'react-redux';

import {
    createVocabularyEntityFromState, fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded,
    submitVocabularyChangesFromState
} from "../../actions/vocabularyActions";
import {
    createMetadataEntityFromState, fetchMetadataBySubjectIfNeeded, submitMetadataChangesFromState
} from "../../actions/metadataActions";
import {
    getMetaVocabulary, getVocabulary, hasMetaVocabularyError, hasVocabularyError, isMetaVocabularyPending,
    isVocabularyPending
} from "../../reducers/cache/vocabularyReducers";
import {getAuthorizations} from "../../reducers/account/authorizationsReducers";
import {emptyLinkedData, fromJsonLd} from "../../utils/linkeddata/jsonLdConverter";
import {
    getCombinedMetadataForSubject, hasMetadataError, isMetadataPending
} from "../../reducers/cache/jsonLdBySubjectReducers";
import {isDataSteward} from "../../utils/userUtils";
import Config from "../../services/Config/Config";
import {propertiesToShow, getTypeInfo, getLabel} from "../../utils/linkeddata/metadataUtils";
import {
    extendPropertiesWithVocabularyEditingInfo, getSystemProperties, isFixedShape
} from "../../utils/linkeddata/vocabularyUtils";
import {getFirstPredicateValue, getFirstPredicateId} from "../../utils/linkeddata/jsonLdUtils";
import {USABLE_IN_VOCABULARY_URI, USABLE_IN_METADATA_URI, SHACL_TARGET_CLASS} from "../../constants";
import {searchVocabulary, searchMetadata} from "../../actions/searchActions";
// import MetadataBrowserContainer from "./metadata/MetadataBrowserContainer";
// import VocabularyBrowserContainer from "./vocabulary/VocabularyBrowserContainer";
import BreadcrumbsContext from '../common/breadcrumbs/BreadcrumbsContext';
import {getMetadataSearchResults, getVocabularySearchResults} from "../../reducers/searchReducers";
import Iri from "../common/Iri";

const toTargetClasses = shapes => shapes.map(c => getFirstPredicateId(c, SHACL_TARGET_CLASS));

// TODO: might be part of UseLinkedDataSearch
// Generic search method, it needs search action and classesInCatalog
const performSearch = (searchLinkedData, getClassesInCatalog) => {
    const classesInCatalog = getClassesInCatalog();
    return ({query, types = [], page, size}) => {
        const shapes = types.length === 0 ? classesInCatalog : classesInCatalog.filter(c => {
            const targetClass = getFirstPredicateId(c, SHACL_TARGET_CLASS);
            return types.includes(targetClass);
        });

        searchLinkedData({query, types: toTargetClasses(shapes), size, page});
    };
};

const LinkedDataContext = React.createContext({});

const LinkedDataVocabularyProvider = ({
    children, fetchMetaVocabulary, fetchMetadataVocabulary, submitVocabularyChanges,
    metaVocabulary, vocabulary, authorizations, createVocabularyEntity, ...otherProps
}) => {
    fetchMetaVocabulary();

    const getEmptyLinkedData = (shape) => emptyLinkedData(metaVocabulary, shape);

    const submitLinkedDataChanges = (formKey) => submitVocabularyChanges(formKey)
        .then(() => fetchMetadataVocabulary());

    const getPropertiesForLinkedData = ({linkedData, subject, isEntityEditable = true}) => {
        const shape = vocabulary.get(subject);

        return extendPropertiesWithVocabularyEditingInfo({
            properties: propertiesToShow(linkedData),
            isFixed: isFixedShape(shape),
            systemProperties: getSystemProperties(shape),
            isEditable: isEntityEditable && isDataSteward(authorizations, Config.get())
        });
    };

    const namespaces = vocabulary.getNamespaces(namespace => getFirstPredicateValue(namespace, USABLE_IN_VOCABULARY_URI));

    const getTypeInfoForLinkedData = (metadata) => getTypeInfo(metadata, metaVocabulary);

    const getClassesInCatalog = () => metaVocabulary.getClassesInCatalog();

    // TODO: This is a temporary render prop, it will be refactored out once LinkedDataBrowser is create
    // const listRenderer = (footerRender) => {
    //     const targetClasses = toTargetClasses(getClassesInCatalog());

    //     return (
    //         targetClasses && targetClasses.length > 0 && (
    //             <VocabularyBrowserContainer
    //                 targetClasses={targetClasses}
    //                 metaVocabulary={metaVocabulary}
    //                 footerRender={footerRender}
    //             />
    //         )
    //     );
    // };

    return (
        <BreadcrumbsContext.Provider value={{
            segments: [
                {
                    label: 'Vocabulary',
                    href: '/vocabulary',
                    icon: 'code'
                }
            ]
        }}
        >
            <LinkedDataContext.Provider
                value={{
                    ...otherProps,
                    fetchLinkedDataForSubject: fetchMetadataVocabulary,
                    getEmptyLinkedData,
                    submitLinkedDataChanges,
                    createLinkedDataEntity: createVocabularyEntity,
                    getPropertiesForLinkedData,
                    namespaces,
                    getDescendants: metaVocabulary.getDescendants,
                    determineShapeForTypes: metaVocabulary.determineShapeForTypes,
                    hasEditRight: isDataSteward(authorizations, Config.get()),
                    getTypeInfoForLinkedData,
                    requireIdentifier: false,
                    getClassesInCatalog,
                    searchLinkedData: performSearch(searchVocabulary, getClassesInCatalog),
                    // listRenderer
                }}
            >
                {children}
            </LinkedDataContext.Provider>
        </BreadcrumbsContext.Provider>
    );
};

const LinkedDataMetadataProvider = ({
    children, fetchMetadataVocabulary, fetchMetadataBySubject,
    submitMetadataChanges, vocabulary, createMetadataEntity, linkedDataSearchResults, searchMetadataDispatch, ...otherProps
}) => {
    fetchMetadataVocabulary();

    const getEmptyLinkedData = (shape) => emptyLinkedData(vocabulary, shape);

    const submitLinkedDataChanges = (formKey) => submitMetadataChanges(formKey)
        .then(() => fetchMetadataBySubject(formKey));

    const getPropertiesForLinkedData = ({linkedData, isEntityEditable = true}) => propertiesToShow(linkedData)
        .map(p => ({
            ...p,
            isEditable: isEntityEditable && !p.machineOnly
        }));

    const namespaces = vocabulary.getNamespaces(namespace => getFirstPredicateValue(namespace, USABLE_IN_METADATA_URI));

    const getTypeInfoForLinkedData = (metadata) => getTypeInfo(metadata, vocabulary);

    const getClassesInCatalog = () => vocabulary.getClassesInCatalog();


    // TODO: This is a temporary render prop, it will be refactored out once LinkedDataBrowser is create
    // const listRenderer = (footerRender) => {
    //     const targetClasses = toTargetClasses(getClassesInCatalog());
    //     return (
    //         targetClasses && targetClasses.length > 0 && (
    //             <MetadataBrowserContainer
    //                 targetClasses={targetClasses}
    //                 vocabulary={vocabulary}
    //                 footerRender={footerRender}
    //             />
    //         )
    //     );
    // };

    const getSearchEntities = () => {
        const {items, total, pending, error} = linkedDataSearchResults;

        const entities = items.map((
            {id, label, comment, type, highlights}
        ) => {
            const shape = vocabulary.determineShapeForTypes(type);
            const typeLabel = getLabel(shape, true);
            const shapeUrl = shape['@id'];

            return {
                id,
                primaryText: (label && label[0]) || <Iri iri={id} />,
                secondaryText: (comment && comment[0]),
                typeLabel,
                shapeUrl,
                highlights
            };
        });

        return {
            searchPending: pending,
            searchError: error,
            entities,
            total,
            hasHighlights: entities.some(({highlights}) => highlights.length > 0),
        };
    };

    return (
        <BreadcrumbsContext.Provider value={{
            segments: [
                {
                    label: 'Metadata',
                    href: '/metadata',
                    icon: 'assignment'
                }
            ]
        }}
        >
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
                    searchLinkedData: performSearch(searchMetadataDispatch, getClassesInCatalog),
                    getSearchEntities,
                }}
            >
                {children}
            </LinkedDataContext.Provider>
        </BreadcrumbsContext.Provider>
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
    const linkedDataSearchResults = getVocabularySearchResults(state);

    return {
        shapesLoading,
        metaVocabulary,
        vocabulary,
        shapesError,
        authorizations,
        isLinkedDataLoading,
        hasLinkedDataErrorForSubject,
        combineLinkedDataForSubject,
        linkedDataSearchResults,
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
    const linkedDataSearchResults = getMetadataSearchResults(state);

    return {
        shapesLoading,
        vocabulary,
        shapesError,
        isLinkedDataLoading,
        hasLinkedDataErrorForSubject,
        combineLinkedDataForSubject,
        linkedDataSearchResults,
    };
};


const mapDispatchToProps = {
    fetchMetaVocabulary: fetchMetaVocabularyIfNeeded,
    fetchMetadataVocabulary: fetchMetadataVocabularyIfNeeded,
    submitVocabularyChanges: submitVocabularyChangesFromState,
    fetchMetadataBySubject: fetchMetadataBySubjectIfNeeded,
    submitMetadataChanges: submitMetadataChangesFromState,
    createMetadataEntity: createMetadataEntityFromState,
    createVocabularyEntity: createVocabularyEntityFromState,
    searchMetadataDispatch: searchMetadata,
    searchVocabularyDispatch: searchVocabulary,
};

export const LinkedDataVocabularyProviderContainer = connect(mapStateToPropsForVocabulary, mapDispatchToProps)(LinkedDataVocabularyProvider);

export const LinkedDataMetadataProviderContainer = connect(mapStateToPropsForMetadata, mapDispatchToProps)(LinkedDataMetadataProvider);

export default LinkedDataContext;
