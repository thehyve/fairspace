import React from 'react';
import {Layout} from '../common';
import WorkspacesPage from '../workspaces/WorkspacePage';
import {WorkspacesProvider} from '../workspaces/WorkspaceContext';
import TopBar from '../common/components/Layout/TopBar';

const WorkspaceListLayout = () => (
    <WorkspacesProvider>
        <Layout
            renderMain={() => (
                <WorkspacesPage />
            )}
            renderTopbar={() => <TopBar title="Workspaces" />}
        />
    </WorkspacesProvider>
);

export default WorkspaceListLayout;
