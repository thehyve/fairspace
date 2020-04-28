import React from 'react';
import {VocabularyProvider} from '../metadata/vocabulary/VocabularyContext';
import {CollectionsProvider} from '../common/contexts/CollectionsContext';
import {Layout, TopBar, usePageTitleUpdater, UsersProvider} from '../common';
import MainMenu from './MainMenu';
import {currentWorkspace} from '../workspaces/workspaces';
import WorkspaceRoutes from '../routes/WorkspaceRoutes';
import {WorkspacesProvider} from "../workspaces/WorkspaceContext";
import {ServicesProvider} from '../common/contexts/ServicesContext';

const WorkspaceLayout = () => {
    const workspace = currentWorkspace();
    usePageTitleUpdater(workspace);

    return (
        <UsersProvider>
            <VocabularyProvider>
                <WorkspacesProvider>
                    <CollectionsProvider>
                        <ServicesProvider>
                            <Layout
                                renderMenu={() => <MainMenu />}
                                renderMain={() => <WorkspaceRoutes />}
                                renderTopbar={() => <TopBar title={workspace} />}
                            />
                        </ServicesProvider>
                    </CollectionsProvider>
                </WorkspacesProvider>
            </VocabularyProvider>
        </UsersProvider>
    );
};

export default WorkspaceLayout;
