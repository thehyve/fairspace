import React from 'react';
import {withRouter} from "react-router-dom";
import {buildSearchUrl, getSearchQueryFromString, SearchBar, TopBar} from "../common";
import {CROSS_WORKSPACES_SEARCH_PATH} from "../constants";

const WorkspaceListTopBar = ({location, history}) => {
    const searchQuery = getSearchQueryFromString(location.search);

    const handleSearch = (value) => {
        const searchUrl = buildSearchUrl(value);
        history.push(`${CROSS_WORKSPACES_SEARCH_PATH}${searchUrl}`);
    };

    return (
        <TopBar title="Workspaces">
            <SearchBar
                query={searchQuery}
                onSearchChange={handleSearch}
                placeholder="Search for metadata in all workspaces"
            />
        </TopBar>
    );
};

export default withRouter(WorkspaceListTopBar);
