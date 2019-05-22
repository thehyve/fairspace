import React from 'react';
import Paper from "@material-ui/core/Paper";
import {connect} from 'react-redux';

import MetadataBrowserContainer from "./MetadataBrowserContainer";
import SearchBar from "../../common/SearchBar";
import BreadCrumbs from "../../common/BreadCrumbs";
import {searchMetadata} from "../../../actions/searchActions";

const MetadataListPage = ({searchMetadata: search}) => (
    <>
        <BreadCrumbs />
        <Paper>
            <SearchBar
                placeholder="Search"
                disableUnderline
                onSearchChange={(query) => {
                    search(query);
                }}
            />
        </Paper>
        <MetadataBrowserContainer />
    </>
);

const mapDispatchToProps = (dispatch) => ({
    searchMetadata: (query) => dispatch(searchMetadata(query))
});

export default connect(null, mapDispatchToProps)(MetadataListPage);
