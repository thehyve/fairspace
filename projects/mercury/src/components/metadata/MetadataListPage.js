import React from 'react';
import Paper from "@material-ui/core/Paper";
import MetadataList from "./MetadataList";
import SearchBar from "../common/SearchBar";
import BreadCrumbs from "../common/BreadCrumbs";

const MetadataListPage = () => (
    <>
        <BreadCrumbs />
        <Paper>
            <SearchBar
                placeholder="Search"
                disabled
                disableUnderline
            />
        </Paper>
        <MetadataList />
    </>
);

export default MetadataListPage;
