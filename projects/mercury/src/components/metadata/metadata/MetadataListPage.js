import React from 'react';
import Paper from "@material-ui/core/Paper";
import {connect} from 'react-redux';

import MetadataBrowserContainer from "./MetadataBrowserContainer";
import SearchBar from "../../common/SearchBar";
import BreadCrumbs from "../../common/BreadCrumbs";
import {searchMetadata} from "../../../actions/searchActions";
import {getVocabulary} from "../../../reducers/cache/vocabularyReducers";
import {getFirstPredicateId} from "../../../utils/linkeddata/jsonLdUtils";
import * as constants from "../../../constants";
import {fetchMetadataVocabularyIfNeeded} from "../../../actions/vocabularyActions";

const MetadataListPage = ({fetchVocabulary, vocabulary, targetClasses, searchMetadata: search}) => {
    fetchVocabulary();

    return (
        <>
            <BreadCrumbs />
            <Paper>
                <SearchBar
                    placeholder="Search"
                    disableUnderline
                    onSearchChange={(query) => {
                        search(query, targetClasses);
                    }}
                />
            </Paper>
            {targetClasses && targetClasses.length > 0 && (
                <MetadataBrowserContainer
                    vocabulary={vocabulary}
                    targetClasses={targetClasses}
                    fetchVocabulary={fetchVocabulary}
                />
            )
            }
        </>
    );
};

const mapStateToProps = (state) => {
    const vocabulary = getVocabulary(state);
    const targetClasses = vocabulary.getClassesInCatalog()
        .map(c => getFirstPredicateId(c, constants.SHACL_TARGET_CLASS));

    return {targetClasses, vocabulary};
};

const mapDispatchToProps = {
    searchMetadata,
    fetchVocabulary: fetchMetadataVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(MetadataListPage);
