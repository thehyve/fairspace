import React from 'react';
import {Footer, Layout, UserProvider} from '../common';
import ProjectsPage from '../projects/ProjectsPage';
import {ProjectsProvider} from '../projects/ProjectsContext';
import TopBar from '../common/components/Layout/TopBar';

const ProjectListLayout = () => (
    <UserProvider>
        <ProjectsProvider>
            <Layout
                renderMain={() => (
                    <ProjectsPage />
                )}
                renderTopbar={() => <TopBar name="Projects" />}
                renderFooter={({id, version}) => <Footer name={id} version={version} />}
            />
        </ProjectsProvider>
    </UserProvider>
);

export default ProjectListLayout;
