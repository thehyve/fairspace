import React, {useContext} from 'react';
import {VocabularyProvider} from '../metadata/vocabulary/VocabularyContext';
import {CollectionsProvider} from '../collections/CollectionsContext';
import MainMenu from './MainMenu';
import {currentWorkspace} from '../workspaces/workspaces';
import WorkspaceRoutes from '../routes/WorkspaceRoutes';
import WorkspaceContext, {WorkspacesProvider} from '../workspaces/WorkspaceContext';
import {ServicesProvider} from '../common/contexts/ServicesContext';
import Layout from './Layout';
import TopBar from './TopBar';
import {UsersProvider} from '../users/UsersContext';
import {FeaturesProvider} from '../common/contexts/FeaturesContext';
import {MetadataViewProvider} from '../metadata/views/MetadataViewContext';
import {MetadataViewFacetsProvider} from '../metadata/views/MetadataViewFacetsContext';
import {ExternalStoragesProvider} from '../external-storage/ExternalStoragesContext';
import {StatusProvider} from '../status/StatusContext';
import type {Workspace} from '../workspaces/WorkspacesAPI';
import {ExternalMetadataSourceProvider} from '../metadata/metadata-sources/ExternalMetadataSourceContext';
import {InternalMetadataSourceProvider} from '../metadata/metadata-sources/InternalMetadataSourceContext';
import {MetadataSourceProvider} from '../metadata/metadata-sources/MetadataSourceContext';

const WorkspaceLayoutInner = () => {
    const {workspaces} = useContext(WorkspaceContext);

    const workspace: Workspace = currentWorkspace() && workspaces.find(w => w.iri === currentWorkspace());
    const title = (workspace && workspace.code) || 'fairspace';

    return (
        <StatusProvider>
            <UsersProvider>
                <VocabularyProvider>
                    <CollectionsProvider>
                        <ServicesProvider>
                            <FeaturesProvider>
                                <ExternalStoragesProvider>
                                    <MetadataSourceProvider>
                                        <ExternalMetadataSourceProvider>
                                            <InternalMetadataSourceProvider>
                                                <MetadataViewFacetsProvider>
                                                    <MetadataViewProvider>
                                                        <Layout
                                                            renderMenu={open => <MainMenu open={open} />}
                                                            renderMain={() => <WorkspaceRoutes />}
                                                            renderTopbar={() => <TopBar title={title} />}
                                                        />
                                                    </MetadataViewProvider>
                                                </MetadataViewFacetsProvider>
                                            </InternalMetadataSourceProvider>
                                        </ExternalMetadataSourceProvider>
                                    </MetadataSourceProvider>
                                </ExternalStoragesProvider>
                            </FeaturesProvider>
                        </ServicesProvider>
                    </CollectionsProvider>
                </VocabularyProvider>
            </UsersProvider>
        </StatusProvider>
    );
};

const WorkspaceLayout = () => (
    <WorkspacesProvider>
        <WorkspaceLayoutInner />
    </WorkspacesProvider>
);

export default WorkspaceLayout;
