import React from 'react';
import {connect} from 'react-redux';

import VocabularyBrowserContainer from "./VocabularyBrowserContainer";
import LinkedDataListPage from "../common/LinkedDataListPage";
import {searchVocabulary} from "../../../actions/searchActions";
import {getMetaVocabulary} from "../../../reducers/cache/vocabularyReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import * as constants from "../../../constants";
import {fetchMetaVocabularyIfNeeded} from "../../../actions/vocabularyActions";

const VocabularyListPage = ({fetchVocabulary, vocabulary, classesInCatalog, search}) => {
    fetchVocabulary();

    const toTargetClasses = shapes => shapes.map(c => getFirstPredicateId(c, constants.SHACL_TARGET_CLASS));

    const performSearch = (queryString, types) => {
        const shapes = types.length === 0 ? classesInCatalog : classesInCatalog.filter(c => {
            const targetClass = getFirstPredicateId(c, constants.SHACL_TARGET_CLASS);
            return types.includes(targetClass);
        });
        search(queryString, toTargetClasses(shapes));
    };

    const targetClasses = toTargetClasses(classesInCatalog);

    return (
        <LinkedDataListPage
            classesInCatalog={classesInCatalog}
            performSearch={performSearch}
            listRenderer={() => (
                targetClasses && targetClasses.length > 0 && (
                    <VocabularyBrowserContainer
                        targetClasses={targetClasses}
                        vocabulary={vocabulary}
                    />
                )
            )}
        />
    );
};

const mapStateToProps = (state) => {
    const vocabulary = getMetaVocabulary(state);
    const classesInCatalog = vocabulary.getClassesInCatalog();
    return {vocabulary, classesInCatalog};
};

const mapDispatchToProps = {
    search: searchVocabulary,
    fetchVocabulary: fetchMetaVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(VocabularyListPage);
