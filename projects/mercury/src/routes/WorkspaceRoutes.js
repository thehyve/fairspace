import React, {useContext} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';

import * as queryString from 'query-string';
import WorkspaceOverview from '../workspaces/WorkspaceOverview';
import Collections from '../collections/CollectionsPage';
import Dashboard from '../dashboard/DashboardPage';
import LlmSearchPage from '../llm/LlmSearchPage';
import FilesPage from '../file/FilesPage';
import {MetadataWrapper} from '../metadata/LinkedDataWrapper';
import LinkedDataEntityPage from '../metadata/common/LinkedDataEntityPage';
import LinkedDataMetadataProvider from '../metadata/LinkedDataMetadataProvider';
import CollectionSearchResultList from '../search/SearchResultList';
import WorkspacesPage from '../workspaces/WorkspacesPage';
import {isAdmin} from '../users/userUtils';
import UserContext from '../users/UserContext';
import UserRolesPage from '../users/UserRolesPage';
import MetadataView from '../metadata/views/MetadataView';
import BreadcrumbsContext from '../common/contexts/BreadcrumbsContext';
import ExternalStoragePage from '../external-storage/ExternalStoragePage';
import ExternalMetadataSourcesView from '../metadata/external-views/ExternalMetadataSourceView';
import InternalMetadataSourceContext from '../metadata/metadata-sources/InternalMetadataSourceContext';

const getSubject = () => (document.location.search ? queryString.parse(document.location.search).iri : null);

// wrapping MetadataView in memo to prevent it from re-rendering
const MetadataViewMemo = React.memo(MetadataView);

const WorkspaceRoutes = () => {
    const {currentUser} = useContext(UserContext);
    const {internalMetadataLabel} = useContext(InternalMetadataSourceContext);

    return (
        <Switch>
            <Route path="/workspaces" exact component={WorkspacesPage} />

            <Route path="/workspace" exact component={WorkspaceOverview} />

            <Route
                path="/dashboard"
                exact
                render={() => (
                    <LinkedDataMetadataProvider>
                        <Dashboard />
                    </LinkedDataMetadataProvider>
                )}
            />

            <Route
                path="/ask"
                exact
                render={() => (
                    <LinkedDataMetadataProvider>
                        <LlmSearchPage />
                    </LinkedDataMetadataProvider>
                )}
            />

            <Route
                path="/collections"
                exact
                render={props => (
                    <LinkedDataMetadataProvider>
                        <Collections history={props.history} showBreadCrumbs />
                    </LinkedDataMetadataProvider>
                )}
            />

            <Route
                path="/collections/:collection/:path(.*)?"
                render={props => (
                    <LinkedDataMetadataProvider>
                        <FilesPage {...props} />
                    </LinkedDataMetadataProvider>
                )}
            />

            <Route
                path="/text-search"
                render={props => (
                    <LinkedDataMetadataProvider>
                        <CollectionSearchResultList {...props} />
                    </LinkedDataMetadataProvider>
                )}
            />

            <Route
                path="/external-storages/:storage"
                render={props => (
                    <LinkedDataMetadataProvider>
                        <ExternalStoragePage {...props} />
                    </LinkedDataMetadataProvider>
                )}
            />

            <Route
                path="/metadata-views"
                render={() => (
                    <BreadcrumbsContext.Provider value={{segments: []}}>
                        <LinkedDataMetadataProvider>
                            <MetadataViewMemo />
                        </LinkedDataMetadataProvider>
                    </BreadcrumbsContext.Provider>
                )}
            />

            <Route
                path="/metadata-sources/:source"
                render={props => (
                    <BreadcrumbsContext.Provider value={{segments: []}}>
                        <LinkedDataMetadataProvider>
                            <ExternalMetadataSourcesView {...props} />
                        </LinkedDataMetadataProvider>
                    </BreadcrumbsContext.Provider>
                )}
            />

            <Route
                path="/metadata"
                exact
                render={() => {
                    if (!currentUser.canViewPublicMetadata) {
                        return null;
                    }

                    const subject = getSubject();
                    if (subject) {
                        return (
                            <MetadataWrapper>
                                <LinkedDataEntityPage title={internalMetadataLabel} subject={subject} />
                            </MetadataWrapper>
                        );
                    }
                    return null;
                }}
            />

            <Route path="/users" exact render={() => isAdmin(currentUser) && <UserRolesPage />} />

            <Redirect to="/dashboard" />
        </Switch>
    );
};

export default WorkspaceRoutes;
