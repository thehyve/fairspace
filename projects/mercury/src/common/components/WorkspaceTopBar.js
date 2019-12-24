import React from 'react';
import {withRouter} from "react-router-dom";
import {buildSearchUrl, getSearchQueryFromString, SearchBar, TopBar} from "..";

const WorkspaceTopBar = ({name, location, history}) => {
    const searchQuery = getSearchQueryFromString(location.search);

    const handleSearch = (value) => {
        const searchUrl = buildSearchUrl(value);
        history.push(searchUrl);
    };

    return (
        <TopBar name={name}>
            <SearchBar query={searchQuery} onSearchChange={handleSearch} />
        </TopBar>
    );
};

export default withRouter(WorkspaceTopBar);
