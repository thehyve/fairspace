import React from 'react';
import {connect} from 'react-redux';

import VocabularyBrowserContainer from "./VocabularyBrowserContainer";
import LinkedDataListPage from "../common/LinkedDataListPage";
import {searchVocabulary} from "../../../actions/searchActions";
import {
    getMetaVocabulary,
    hasMetaVocabularyError,
    hasVocabularyError,
    isMetaVocabularyPending,
    isVocabularyPending
} from "../../../reducers/cache/vocabularyReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import * as constants from "../../../constants";
import {fetchMetadataVocabularyIfNeeded, fetchMetaVocabularyIfNeeded} from "../../../actions/vocabularyActions";
import {LoadingInlay, MessageDisplay} from "../../common";
import VocabularyBreadcrumbsContextProvider from "./VocabularyBreadcrumbsContextProvider";

const VocabularyListPage = (
    {fetchVocabulary, fetchMetaVocabulary, loading, error, metaVocabulary, classesInCatalog, search}
) => {
    // We need both the vocabulary (for namespaces) and metavocabulary (for shapes) here
    fetchVocabulary();
    fetchMetaVocabulary();

    const toTargetClasses = shapes => shapes.map(c => getFirstPredicateId(c, constants.SHACL_TARGET_CLASS));

    const performSearch = ({query, types, page, size}) => {
        const shapes = types.length === 0 ? classesInCatalog : classesInCatalog.filter(c => {
            const targetClass = getFirstPredicateId(c, constants.SHACL_TARGET_CLASS);
            return types.includes(targetClass);
        });
        const targetClasses = toTargetClasses(shapes);
        search({query, types: targetClasses, size, page});
    };

    const targetClasses = toTargetClasses(classesInCatalog);

    if (loading) {
        return <LoadingInlay />;
    }

    if (error) {
        return <MessageDisplay message={error.message || 'Sorry unable to load the vocabulary.'} />;
    }

    return (
        <VocabularyBreadcrumbsContextProvider>
            <LinkedDataListPage
                classesInCatalog={classesInCatalog}
                performSearch={performSearch}
                listRenderer={(footerRender) => (
                    targetClasses && targetClasses.length > 0 && (
                        <VocabularyBrowserContainer
                            targetClasses={targetClasses}
                            metaVocabulary={metaVocabulary}
                            footerRender={footerRender}
                        />
                    )
                )}
            />
        </VocabularyBreadcrumbsContextProvider>
    );
};

const mapStateToProps = (state) => {
    const metaVocabulary = getMetaVocabulary(state);
    const loading = isMetaVocabularyPending(state) || isVocabularyPending(state);
    const error = hasMetaVocabularyError(state) || hasVocabularyError(state);
    const classesInCatalog = metaVocabulary.getClassesInCatalog();

    return {
        loading,
        error,
        metaVocabulary,
        classesInCatalog
    };
};

const mapDispatchToProps = {
    search: searchVocabulary,
    fetchVocabulary: fetchMetadataVocabularyIfNeeded,
    fetchMetaVocabulary: fetchMetaVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(VocabularyListPage);
