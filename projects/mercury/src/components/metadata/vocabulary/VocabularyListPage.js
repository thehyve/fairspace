import React from 'react';
import {connect} from 'react-redux';

import VocabularyBrowserContainer from "./VocabularyBrowserContainer";
import LinkedDataListPage from "../common/LinkedDataListPage";
import {searchVocabulary} from "../../../actions/searchActions";
import {getMetaVocabulary, isMetaVocabularyPending, hasMetaVocabularyError} from "../../../reducers/cache/vocabularyReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import * as constants from "../../../constants";
import {fetchMetaVocabularyIfNeeded} from "../../../actions/vocabularyActions";
import {LoadingInlay, MessageDisplay} from "../../common";

const VocabularyListPage = (
    {fetchVocabulary, loading, error, metaVocabulary, classesInCatalog, search}
) => {
    fetchVocabulary();

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
    );
};

const mapStateToProps = (state) => {
    const metaVocabulary = getMetaVocabulary(state);
    const loading = isMetaVocabularyPending(state);
    const error = hasMetaVocabularyError(state);
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
    fetchVocabulary: fetchMetaVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(VocabularyListPage);
