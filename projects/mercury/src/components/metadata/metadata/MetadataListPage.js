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

const MetadataListPage = ({fetchVocabulary, classesInCatalog, searchMetadata: search}) => {
    fetchVocabulary();

    return (
        <>
            <BreadCrumbs />
            <Paper>
                <SearchBar
                    placeholder="Search"
                    disableUnderline
                    onSearchChange={(query) => {
                        search(query, classesInCatalog);
                    }}
                />
            </Paper>
            <MetadataBrowserContainer classesInCatalog={classesInCatalog} />
        </>
    );
};

const mapStateToProps = (state) => {
    const vocabulary = getVocabulary(state);
    const classesInCatalog = vocabulary.getClassesInCatalog()
        .map(c => getFirstPredicateId(c, constants.SHACL_TARGET_CLASS));

    return {classesInCatalog};
};

const mapDispatchToProps = {
    searchMetadata,
    fetchVocabulary: fetchMetadataVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(MetadataListPage);
