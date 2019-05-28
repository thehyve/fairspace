import React from 'react';
import {connect} from 'react-redux';

import LinkedDataListPage from "../common/LinkedDataListPage";
import MetadataBrowserContainer from "./MetadataBrowserContainer";
import {searchMetadata} from "../../../actions/searchActions";
import {getVocabulary} from "../../../reducers/cache/vocabularyReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import * as constants from "../../../constants";
import {fetchMetadataVocabularyIfNeeded} from "../../../actions/vocabularyActions";

const MetadataListPage = ({fetchVocabulary, vocabulary, classesInCatalog, search}) => {
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
                    <MetadataBrowserContainer
                        targetClasses={targetClasses}
                        vocabulary={vocabulary}
                    />
                )
            )}
        />
    );
};

const mapStateToProps = (state) => {
    const vocabulary = getVocabulary(state);
    const classesInCatalog = vocabulary.getClassesInCatalog();
    return {vocabulary, classesInCatalog};
};

const mapDispatchToProps = {
    search: searchMetadata,
    fetchVocabulary: fetchMetadataVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(MetadataListPage);
