import React from 'react';
import {VocabularyProvider} from '../metadata/VocabularyContext';
import {CollectionsProvider} from '../common/contexts/CollectionsContext';
import {Layout, TopBar, usePageTitleUpdater, UsersProvider} from '../common';
import WorkspaceMenu from './WorkspaceMenu';
import {currentWorkspace} from '../workspaces/workspaces';
import WorkspaceRoutes from '../routes/WorkspaceRoutes';
import {WorkspaceUserProvider} from '../common/contexts/WorkspaceUserContext';

const WorkspaceLayout = () => {
    const workspace = currentWorkspace();
    usePageTitleUpdater(workspace);

    return (
        <WorkspaceUserProvider>
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
        </WorkspaceUserProvider>
    );
};

export default WorkspaceLayout;
