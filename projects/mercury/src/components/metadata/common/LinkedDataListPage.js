import React from 'react';
import Paper from "@material-ui/core/Paper";

import SearchBar from "../../common/SearchBar";
import BreadCrumbs from "../../common/BreadCrumbs";

const LinkedDataListPage = ({listRenderer, onSearchChange}) => (
    <>
        <BreadCrumbs />
        <Paper>
            <SearchBar
                placeholder="Search"
                disableUnderline
                onSearchChange={onSearchChange}
            />
        </Paper>
        {listRenderer()}
    </>
);

export default LinkedDataListPage;
