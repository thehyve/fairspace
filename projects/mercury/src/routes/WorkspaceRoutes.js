import React, {useContext} from 'react';
import {Redirect, Route, Switch} from "react-router-dom";

import * as queryString from 'query-string';
import WorkspaceOverview from "../workspaces/WorkspaceOverview";
import Collections from "../collections/CollectionsPage";
import FilesPage from "../file/FilesPage";
import {MetadataWrapper} from '../metadata/LinkedDataWrapper';
import LinkedDataEntityPage from "../metadata/common/LinkedDataEntityPage";
import LinkedDataMetadataProvider from "../metadata/LinkedDataMetadataProvider";
import CollectionSearchResultList from "../search/SearchResultList";
import WorkspacesPage from "../workspaces/WorkspacesPage";
import {isAdmin} from "../users/userUtils";
import UserContext from "../users/UserContext";
import UserRolesPage from "../users/UserRolesPage";
import MetadataView from '../metadata/views/MetadataView';
import BreadcrumbsContext from '../common/contexts/BreadcrumbsContext';
import ExternalStoragePage from "../external-storage/ExternalStoragePage";

const getSubject = () => (
    document.location.search ? queryString.parse(document.location.search).iri : null
);

const WorkspaceRoutes = () => {
    const {currentUser} = useContext(UserContext);

    return (
        <Switch>
            <Route path="/workspaces" exact component={WorkspacesPage} />

            <Route path="/workspace" exact component={WorkspaceOverview} />

            <Route
                path="/collections"
                exact
                render={(props) => (
                    <LinkedDataMetadataProvider>
                        <Collections history={props.history} showBreadCrumbs />
                    </LinkedDataMetadataProvider>
                )}
            />

            <Route
                path="/collections/:collection/:path(.*)?"
                render={(props) => (
                    <LinkedDataMetadataProvider>
                        <FilesPage {...props} />
                    </LinkedDataMetadataProvider>
                )}
            />

            <Route
                path="/text-search"
                render={(props) => (
                    <LinkedDataMetadataProvider>
                        <CollectionSearchResultList {...props} />
                    </LinkedDataMetadataProvider>
                )}
            />

            <Route
                path="/external-storages/:storage"
                render={(props) => (
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
                            <MetadataView />
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
                                <LinkedDataEntityPage title="Metadata" subject={subject} />
                            </MetadataWrapper>
                        );
                    }
                    return null;
                }}
            />

            <Route
                path="/users"
                exact
                render={() => (isAdmin(currentUser) && (<UserRolesPage />))}
            />

            <Redirect to="/workspaces" />
        </Switch>
    );
};

export default WorkspaceRoutes;
