import React from 'react';
import {Redirect, Route, Switch} from "react-router-dom";

import * as queryString from 'query-string';
import WorkspaceOverview from "../home/Home";
import Collections from "../collections/CollectionsPage";
import FilesPage from "../file/FilesPage";
import SearchPage from '../search/SearchPage';
import {createMetadataIri, createVocabularyIri} from "../common/utils/linkeddata/metadataUtils";
import {MetadataWrapper, VocabularyWrapper} from '../metadata/LinkedDataWrapper';
import LinkedDataEntityPage from "../metadata/common/LinkedDataEntityPage";
import MetadataOverviewPage from "../metadata/MetadataOverviewPage";
import VocabularyOverviewPage from "../metadata/VocabularyOverviewPage";
import LinkedDataMetadataProvider from "../metadata/LinkedDataMetadataProvider";
import UsersPage from '../users/UsersPage';
import CollectionSearchResultList from "../collections/CollectionsSearchResultList";
import WorkspacePage from "../workspaces/WorkspacePage";

const getSubject = () => (
    document.location.search ? decodeURIComponent(queryString.parse(document.location.search).iri) : null
);

const WorkspaceRoutes = () => (
    <Switch>
        <Route path="/workspaces" exact component={WorkspacePage} />

        <Route path="/workspaces/:workspace" exact component={WorkspaceOverview} />

        <Route
            path="/workspaces/:workspace/users"
            exact
            component={UsersPage}
        />

        <Route
            path="/collections"
            exact
            render={(props) => (
                <LinkedDataMetadataProvider>
                    <Collections history={props.history} />
                </LinkedDataMetadataProvider>
            )}
        />

        <Route
            path="/collections/search"
            render={(props) => (
                <LinkedDataMetadataProvider>
                    <CollectionSearchResultList {...props} />
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
            path="/metadata"
            exact
            render={() => {
                const subject = getSubject();

                return (
                    <MetadataWrapper>
                        {subject ? <LinkedDataEntityPage title="Metadata" subject={subject} /> : <MetadataOverviewPage />}
                    </MetadataWrapper>
                );
            }}
        />

        <Route
            /* This route redirects a metadata iri which is entered directly to the metadata editor */
            path="/iri/**"
            render={({match}) => (<Redirect to={"/metadata?iri=" + encodeURIComponent(createMetadataIri(match.params[0]))} />)}
        />

        <Route
            path="/vocabulary"
            exact
            render={() => {
                const subject = getSubject();

                return (
                    <VocabularyWrapper>
                        {subject ? <LinkedDataEntityPage title="Vocabulary" subject={subject} /> : <VocabularyOverviewPage />}
                    </VocabularyWrapper>
                );
            }}
        />

        <Route
            /* This route redirects a metadata iri which is entered directly to the metadata editor */
            path="/vocabulary/**"
            render={({match}) => (<Redirect to={"/vocabulary?iri=" + encodeURIComponent(createVocabularyIri(match.params[0]))} />)}
        />

        <Route
            path="/search"
            render={({location, history}) => <SearchPage location={location} history={history} />}
        />
    </Switch>
);

export default WorkspaceRoutes;
