import React from 'react';
import {withRouter} from "react-router-dom";
import {buildSearchUrl, getSearchQueryFromString, SearchBar, TopBar} from "../common";

const WorkspaceTopBar = ({workspace, location, history}) => {
    const searchQuery = getSearchQueryFromString(location.search);

    const handleSearch = (value) => {
        const searchUrl = buildSearchUrl(value);
        history.push(`/workspaces/${workspace}${searchUrl}`);
    };

    return (
        <TopBar title={workspace}>
            <SearchBar query={searchQuery} onSearchChange={handleSearch} />
        </TopBar>
    );
};

export default withRouter(WorkspaceTopBar);
