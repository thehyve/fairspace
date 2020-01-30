import React from 'react';
import type {Project} from './ProjectsAPI';
import ProjectsAPI from './ProjectsAPI';
import {PROJECT_URI} from "../constants";
import {handleSearchError, SearchAPI, SORT_DATE_CREATED} from "../common";
import {PROJECTS_MAX_SIZE} from "../common/constants";

const ProjectsContext = React.createContext({});

export const ProjectsProvider = ({children, projectsAPI = ProjectsAPI}) => {
    const searchAllProjects = () => SearchAPI
        .searchAll({types: [PROJECT_URI], size: PROJECTS_MAX_SIZE, sort: SORT_DATE_CREATED})
        .catch(handleSearchError);
    const createProject = (project: Project) => projectsAPI.createProject(project);

    return (
        <ProjectsContext.Provider
            value={{
                searchAllProjects,
                createProject
            }}
        >
            {children}
        </ProjectsContext.Provider>
    );
};

export default ProjectsContext;
