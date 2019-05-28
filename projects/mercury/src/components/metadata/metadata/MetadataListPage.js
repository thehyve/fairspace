import React from 'react';
import {connect} from 'react-redux';

import LinkedDataListPage from "../common/LinkedDataListPage";
import MetadataBrowserContainer from "./MetadataBrowserContainer";
import {searchMetadata} from "../../../actions/searchActions";
import {getVocabulary} from "../../../reducers/cache/vocabularyReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import * as constants from "../../../constants";
import {fetchMetadataVocabularyIfNeeded} from "../../../actions/vocabularyActions";

const MetadataListPage = ({fetchVocabulary, vocabulary, search, targetClasses}) => {
    fetchVocabulary();

    return (
        <LinkedDataListPage
            onSearchChange={(query) => search(query, targetClasses)}
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
    const targetClasses = vocabulary.getClassesInCatalog()
        .map(c => getFirstPredicateId(c, constants.SHACL_TARGET_CLASS));
    return {vocabulary, targetClasses};
};

const mapDispatchToProps = {
    search: searchMetadata,
    fetchVocabulary: fetchMetadataVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(MetadataListPage);
