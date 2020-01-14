import {Footer, Layout, UserProvider} from '../common';
import WorkspaceTopBar from '../common/components/WorkspaceTopBar';
import React from 'react';
import ProjectsPage from '../projects/ProjectsPage';
import {ProjectsProvider} from '../projects/ProjectsContext';

const ProjectListLayout = () => {
    return (
        <UserProvider>
            <ProjectsProvider>
                <Layout
                    requiredAuthorization={'CanRead'}
                    renderMain={() => (
                        <ProjectsPage/>
                    )}
                    renderTopbar={() => <WorkspaceTopBar name={'Projects'}/>}
                    renderFooter={({id, version}) => <Footer name={id} version={version}/>}
                />
            </ProjectsProvider>
        </UserProvider>
    );
};

export default ProjectListLayout;
