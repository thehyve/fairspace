// @flow
import React from 'react';
import {useAsync} from '../common/hooks';
import ProjectsAPI from './ProjectsAPI';
import type {Project} from './ProjectsAPI';

const ProjectsContext = React.createContext({});

export const ProjectsProvider = ({children, projectsAPI = ProjectsAPI}) => {
    const {data: projects = [], error: projectsError, loading: projectsLoading, refresh} = useAsync(projectsAPI.getProjects);

    const createProject = (project: Project) => projectsAPI.createProject(project).then(refresh);

    return (
        <ProjectsContext.Provider
            value={{
                projects,
                projectsError,
                projectsLoading,
                refresh,
                createProject
            }}
        >
            {children}
        </ProjectsContext.Provider>
    );
};

export default ProjectsContext;
