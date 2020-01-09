// @flow
import React, {useContext, useState} from 'react';
import {withRouter} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {ErrorDialog, LoadingInlay, MessageDisplay, UserContext, UsersContext} from '../common';
import ProjectList from './ProjectList';
import ProjectsContext from './ProjectsContext';
import type {Project} from './ProjectsAPI';
import ProjectEditor from './ProjectEditor';

export const ProjectBrowser = ({
    loading = false,
    error = false,
    projects = [],
    createProject = () => {},
    users = []
}) => {
    const [creatingProject, setCreatingProject] = useState(false);

    const handleCreateProjectClick = () => setCreatingProject(true);

    const handleSaveProject = (project: Project) => {
        createProject(project)
            .then(() => setCreatingProject(false))
            .catch(err => {
                const message = err && err.message ? err.message : "An error occurred while creating a collection";
                ErrorDialog.showError(err, message);
            });
    };

    const handleCancelCreateProject = () => setCreatingProject(false);

    const renderProjectList = () => {
        projects.forEach((project: Project) => {
            // project.creatorObj = users.find(u => u.iri === project.createdBy);
        });

        return (
            <>
                <ProjectList
                    projects={projects}
                />
                {creatingProject ? (
                    <ProjectEditor
                        title="Create project"
                        onSave={handleSaveProject}
                        onClose={handleCancelCreateProject}
                    />
                ) : null}
            </>
        );
    };

    if (error) {
        return <MessageDisplay message="An error occurred while loading projects" />;
    }

    return (
        <>
            {loading ? <LoadingInlay /> : renderProjectList()}
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
        </>
    );
};

const ContextualProjectBrowser = (props) => {
    const {currentUserError, currentUserLoading} = useContext(UserContext);
    const {users, usersLoading, usersError} = useContext(UsersContext);
    const {projects, collectionsLoading, collectionsError, createProject} = useContext(ProjectsContext);

    return (
        <ProjectBrowser
            {...props}
            projects={projects}
            createProject={createProject}
            users={users}
            loading={collectionsLoading || currentUserLoading || usersLoading}
            error={collectionsError || currentUserError || usersError}
        />
    );
};

export default withRouter(ContextualProjectBrowser);
