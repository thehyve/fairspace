import React from 'react';
import Paper from "@material-ui/core/Paper";
import VocabularyBrowserContainer from "./VocabularyBrowserContainer";
import SearchBar from "../../common/SearchBar";
import BreadCrumbs from "../../common/BreadCrumbs";

const VocabularyListPage = () => (
    <>
        <BreadCrumbs />
        <Paper>
            <SearchBar
                placeholder="Search"
                disabled
                disableUnderline
            />
        </Paper>
        <VocabularyBrowserContainer />
    </>
);

export default VocabularyListPage;
