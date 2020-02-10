import React from 'react';
import {withRouter} from "react-router-dom";
import {buildSearchUrl, getSearchQueryFromString, SearchBar, TopBar} from "../common";

const WorkspaceListTopBar = ({location, history}) => {
    const searchQuery = getSearchQueryFromString(location.search);

    const handleSearch = (value) => {
        const searchUrl = buildSearchUrl(value);
        history.push(`/workspaces/_all${searchUrl}`);
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
