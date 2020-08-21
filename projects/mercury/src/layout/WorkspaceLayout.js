import React, {useContext} from 'react';
import {VocabularyProvider} from '../metadata/vocabulary/VocabularyContext';
import {CollectionsProvider} from '../collections/CollectionsContext';
import usePageTitleUpdater from '../common/hooks/UsePageTitleUpdater';
import MainMenu from './MainMenu';
import {currentWorkspace} from '../workspaces/workspaces';
import WorkspaceRoutes from '../routes/WorkspaceRoutes';
import WorkspaceContext, {WorkspacesProvider} from "../workspaces/WorkspaceContext";
import {ServicesProvider} from '../common/contexts/ServicesContext';
import Layout from "./Layout";
import TopBar from "./TopBar";
import {UsersProvider} from "../users/UsersContext";

const WorkspaceLayoutInner = () => {
    const {workspaces} = useContext(WorkspaceContext);

    const workspace = currentWorkspace() && workspaces.find(w => w.iri === currentWorkspace());
    const title = (workspace && workspace.name) || '';
    usePageTitleUpdater(title);

    return (
        <UsersProvider>
            <VocabularyProvider>
                <CollectionsProvider>
                    <ServicesProvider>
                        <Layout
                            renderMenu={() => <MainMenu />}
                            renderMain={() => <WorkspaceRoutes />}
                            renderTopbar={() => <TopBar title={title} />}
                        />
                    </ServicesProvider>
                </CollectionsProvider>
            </VocabularyProvider>
        </UsersProvider>
    );
};

const WorkspaceLayout = () => (
    <WorkspacesProvider>
        <WorkspaceLayoutInner />
    </WorkspacesProvider>

);

export default WorkspaceLayout;
