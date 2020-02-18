import React from 'react';
import {VocabularyProvider} from '../metadata/VocabularyContext';
import {CollectionsProvider} from '../common/contexts/CollectionsContext';
import {Layout, TopBar, usePageTitleUpdater, UsersProvider} from '../common';
import WorkspaceMenu from './WorkspaceMenu';
import {currentWorkspace} from '../workspaces/workspaces';
import WorkspaceRoutes from '../routes/WorkspaceRoutes';

const WorkspaceLayout = () => {
    const workspace = currentWorkspace();
    usePageTitleUpdater(workspace);

    return (
        <UsersProvider>
            <VocabularyProvider>
                <CollectionsProvider>
                    <Layout
                        renderMenu={() => <WorkspaceMenu />}
                        renderMain={() => (
                            <WorkspaceRoutes />
                        )}
                        renderTopbar={() => <TopBar title={workspace} />}
                    />
                </CollectionsProvider>
            </VocabularyProvider>
        </UsersProvider>
    );
};

export default WorkspaceLayout;
