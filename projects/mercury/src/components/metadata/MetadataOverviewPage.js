import React from 'react';
import Paper from "@material-ui/core/Paper";
import MetadataEntities from "./MetadataEntities";
import SearchBar from "../common/SearchBar";
import BreadCrumbs from "../common/BreadCrumbs";

const MetadataOverviewPage = () => (
    <>
        <BreadCrumbs />
        <Paper>
            <SearchBar
                placeholder="Search"
                disabled
                disableUnderline
            />
        </Paper>
        <MetadataEntities />

    </>
);


export default MetadataOverviewPage;
