import React from 'react';
import {Layout} from '../common';
import ProjectsPage from '../projects/ProjectsPage';
import {ProjectsProvider} from '../projects/ProjectsContext';
import TopBar from '../common/components/Layout/TopBar';

const ProjectListLayout = () => (
    <ProjectsProvider>
        <Layout
            renderMain={() => (
                <ProjectsPage />
            )}
            renderTopbar={() => <TopBar title="Projects" />}
        />
    </ProjectsProvider>
);

export default ProjectListLayout;
