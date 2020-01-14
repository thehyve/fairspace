import {VocabularyProvider} from '../metadata/VocabularyContext';
import {CollectionsProvider} from '../common/contexts/CollectionsContext';
import {Footer, Layout, usePageTitleUpdater, UserProvider, UsersProvider} from '../common';
import ProjectMenu from './ProjectMenu';
import WorkspaceTopBar from '../common/components/WorkspaceTopBar';
import React from 'react';
import {currentProject} from '../projects/projects';
import ProjectRoutes from '../routes/ProjectRoutes';

const ProjectLayout = () => {
    const project = currentProject();
    usePageTitleUpdater(project);

    return (
        <UserProvider>
            <VocabularyProvider>
                <CollectionsProvider>
                    <Layout
                        requiredAuthorization={'CanRead'}
                        renderMenu={() => <ProjectMenu/>}
                        renderMain={() => (
                            <UsersProvider>
                                <ProjectRoutes/>
                            </UsersProvider>
                        )}
                        renderTopbar={() => <WorkspaceTopBar name={project}/>}
                        renderFooter={({id, version}) => <Footer name={id} version={version}/>}
                    />
                </CollectionsProvider>
            </VocabularyProvider>
        </UserProvider>
    );
};

export default ProjectLayout;
