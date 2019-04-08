import React from 'react';
import Paper from "@material-ui/core/Paper";
import VocabularyListContainer from "./VocabularyListContainer";
import SearchBar from "../common/SearchBar";
import BreadCrumbs from "../common/BreadCrumbs";

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
        <VocabularyListContainer />
    </>
);

export default VocabularyListPage;
