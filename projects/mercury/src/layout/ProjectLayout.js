import React from 'react';
import {VocabularyProvider} from '../metadata/VocabularyContext';
import {CollectionsProvider} from '../common/contexts/CollectionsContext';
import {Layout, usePageTitleUpdater, UsersProvider} from '../common';
import ProjectMenu from './ProjectMenu';
import ProjectTopBar from './ProjectTopBar';
import {currentProject} from '../projects/projects';
import ProjectRoutes from '../routes/ProjectRoutes';
import {ProjectUserProvider} from '../common/contexts/ProjectUserContext';

const ProjectLayout = () => {
    const project = currentProject();
    usePageTitleUpdater(project);

    return (
        <ProjectUserProvider>
            <UsersProvider>
                <VocabularyProvider>
                    <CollectionsProvider>
                        <Layout
                            renderMenu={() => <ProjectMenu />}
                            renderMain={() => (
                                <ProjectRoutes />
                            )}
                            renderTopbar={() => <ProjectTopBar project={project} />}
                        />
                    </CollectionsProvider>
                </VocabularyProvider>
            </UsersProvider>
        </ProjectUserProvider>
    );
};

export default ProjectLayout;
