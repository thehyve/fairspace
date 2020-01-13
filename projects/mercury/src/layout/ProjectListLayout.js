import {Footer, Layout, UsersProvider} from '../common';
import WorkspaceTopBar from '../common/components/WorkspaceTopBar';
import React from 'react';
import Config from '../common/services/Config';
import ProjectsPage from '../projects/ProjectsPage';
import {ProjectsProvider} from '../projects/ProjectsContext';

const ProjectListLayout = () => {
    const requiredRole = Config.get().roles.user;
    return (
        <ProjectsProvider>
            <Layout
                requiredAuthorization={requiredRole}
                renderMain={() => (
                    <UsersProvider>
                        <ProjectsPage />
                    </UsersProvider>
                )}
                renderTopbar={() => <WorkspaceTopBar name={'Projects'} />}
                renderFooter={({id, version}) => <Footer name={id} version={version} />}
            />
        </ProjectsProvider>
    );
};

export default ProjectListLayout;
