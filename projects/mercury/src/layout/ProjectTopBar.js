import React from 'react';
import {withRouter} from "react-router-dom";
import {buildSearchUrl, getSearchQueryFromString, SearchBar, TopBar} from "../common";

const ProjectTopBar = ({project, location, history}) => {
    const searchQuery = getSearchQueryFromString(location.search);

    const handleSearch = (value) => {
        const searchUrl = buildSearchUrl(value);
        history.push(`/projects/${project}${searchUrl}`);
    };

    return (
        <TopBar title={project}>
            <SearchBar query={searchQuery} onSearchChange={handleSearch} />
        </TopBar>
    );
};

export default withRouter(ProjectTopBar);
