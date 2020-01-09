import {VocabularyProvider} from '../metadata/VocabularyContext';
import {CollectionsProvider} from '../common/contexts/CollectionsContext';
import {Footer, Layout, usePageTitleUpdater, UsersProvider} from '../common';
import ProjectMenu from './ProjectMenu';
import WorkspaceTopBar from '../common/components/WorkspaceTopBar';
import React from 'react';
import Config from '../common/services/Config';
import {currentProject} from '../projects/projects';
import ProjectRoutes from '../routes/ProjectRoutes';

const ProjectLayout = () => {
    const requiredRole = Config.get().roles.user;

    const project = currentProject();
    usePageTitleUpdater(project);

    return (
        <VocabularyProvider>
            <CollectionsProvider>
                <Layout
                    requiredAuthorization={requiredRole}
                    renderMenu={() => <ProjectMenu />}
                    renderMain={() => (
                        <UsersProvider>
                            <ProjectRoutes />
                        </UsersProvider>
                    )}
                    renderTopbar={() => <WorkspaceTopBar name={project} />}
                    renderFooter={({id, version}) => <Footer name={id} version={version} />}
                />
            </CollectionsProvider>
        </VocabularyProvider>
    );
};

export default ProjectLayout;
