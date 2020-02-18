import React from 'react';
import {Layout} from '../common';
import {WorkspacesProvider} from '../workspaces/WorkspaceContext';
import WorkspaceListTopBar from "./WorkspaceListTopBar";
import WorkspacesPage from "../workspaces/WorkspacePage";

const WorkspaceListLayout = () => (
    <WorkspacesProvider>
        <Layout
            renderMain={() => <WorkspacesPage />}
            renderTopbar={() => <WorkspaceListTopBar />}
        />
    </WorkspacesProvider>
);

export default WorkspaceListLayout;
