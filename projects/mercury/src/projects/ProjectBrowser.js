// @flow
import React, {useContext, useState} from 'react';
import {withRouter, useHistory} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {ErrorDialog, LoadingInlay, MessageDisplay, UserContext, UsersContext} from '../common';
import ProjectList from './ProjectList';
import ProjectsContext from './ProjectsContext';
import type {Project} from './ProjectsAPI';
import ProjectEditor from './ProjectEditor';


type ProjectBrowserProps = {
    loading: boolean,
    error: boolean,
    projects: Project[],
    createProject: (Project) => Promise<Project>
}

export const ProjectBrowser = (props: ProjectBrowserProps) => {
    const {loading, error, projects, createProject} = props;
    const [creatingProject, setCreatingProject] = useState(false);
    const [loadingCreatedProject, setLoadingCreatedProject] = useState(false);
    const {currentUser} = useContext(UserContext);

    const history = useHistory();

    const handleCreateProjectClick = () => setCreatingProject(true);

    const handleSaveProject = async (project: Project) => {
        setLoadingCreatedProject(true);
        return createProject(project)
            .then(() => {
                setCreatingProject(false);
                setLoadingCreatedProject(false);
                history.push(`/projects/${project.id}/`);
            })
            .catch(err => {
                setLoadingCreatedProject(false);
                const message = err && err.message ? err.message : "An error occurred while creating a project";
                ErrorDialog.showError(err, message);
            });
    };

    const handleCancelCreateProject = () => setCreatingProject(false);

    const renderProjectList = () => (
    // projects.forEach((project: Project) => {
    //     project.creatorObj = users.find(u => u.iri === project.createdBy);
    // });
        <>
            <ProjectList
                projects={projects}
            />
            {creatingProject ? (
                <ProjectEditor
                    title="Create project"
                    onSubmit={handleSaveProject}
                    onClose={handleCancelCreateProject}
                    creating={loadingCreatedProject}
                    projects={projects}
                />
            ) : null}
        </>
    );

    const renderAddProjectButton = () => (
        <Button
            style={{marginTop: 8}}
            color="primary"
            variant="contained"
            aria-label="Add"
            title="Create a new project"
            onClick={handleCreateProjectClick}
        >
            New
        </Button>
    );

    if (error) {
        return <MessageDisplay message="An error occurred while loading projects" />;
    }

    return (
        <>
            {loading ? <LoadingInlay /> : renderProjectList()}
            {currentUser.admin ? renderAddProjectButton() : null }
        </>
    );
};

ProjectBrowser.defaultProps = {
    loading: false,
    error: false
};

const ContextualProjectBrowser = (props) => {
    const {currentUserError, currentUserLoading} = useContext(UserContext);
    const {users, usersLoading, usersError} = useContext(UsersContext);
    const {projects, projectsLoading, projectsError, createProject} = useContext(ProjectsContext);

    return (
        <ProjectBrowser
            {...props}
            projects={projects}
            createProject={createProject}
            users={users}
            loading={projectsLoading || currentUserLoading || usersLoading}
            error={projectsError || currentUserError || usersError}
        />
    );
};

export default withRouter(ContextualProjectBrowser);
