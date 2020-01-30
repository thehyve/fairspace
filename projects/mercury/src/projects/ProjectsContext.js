import React from 'react';
import type {Project} from './ProjectsAPI';
import ProjectsAPI from './ProjectsAPI';
import {useAsync} from '../common/hooks';

const ProjectsContext = React.createContext({});

export const ProjectsProvider = ({children, projectsAPI = ProjectsAPI}) => {
    const {data: projects = [], error: projectsError, loading: projectsLoading, refresh} = useAsync(projectsAPI.getProjects);
    const createProject = (project: Project) => projectsAPI.createProject(project);

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
