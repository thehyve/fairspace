import React from 'react';
import {Redirect, Route} from "react-router-dom";

import * as queryString from 'query-string';
import ProjectOverview from "../home/Home";
import Collections from "../collections/CollectionsPage";
import Notebooks from "../notebooks/Notebooks";
import FilesPage from "../file/FilesPage";
import SearchPage from '../search/SearchPage';
import {createMetadataIri, createVocabularyIri} from "../common/utils/linkeddata/metadataUtils";
import {MetadataWrapper, VocabularyWrapper} from '../metadata/LinkedDataWrapper';
import LinkedDataEntityPage from "../metadata/common/LinkedDataEntityPage";
import MetadataOverviewPage from "../metadata/MetadataOverviewPage";
import VocabularyOverviewPage from "../metadata/VocabularyOverviewPage";
import LinkedDataMetadataProvider from "../metadata/LinkedDataMetadataProvider";

const getSubject = () => (
    document.location.search ? decodeURIComponent(queryString.parse(document.location.search).iri) : null
);

const ProjectRoutes = () => (
    <>
        <Route path="/projects/:project" exact component={ProjectOverview} />

        <Route
            path="/projects/:project/collections"
            exact
            render={() => (
                <LinkedDataMetadataProvider>
                    <Collections />
                </LinkedDataMetadataProvider>
            )}
        />

        <Route
            path="/projects/:project/collections/:collection/:path(.*)?"
            render={(props) => (
                <LinkedDataMetadataProvider>
                    <FilesPage {...props} />
                </LinkedDataMetadataProvider>
            )}
        />

        <Route path="/projects/:project/notebooks" exact component={Notebooks} />

        <Route
            path="/projects/:project/metadata"
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
            path="/projects/:project/iri/**"
            render={({match}) => (<Redirect to={"/metadata?iri=" + encodeURIComponent(createMetadataIri(match.params[0]))} />)}
        />

        <Route
            path="/projects/:project/vocabulary"
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
            path="/projects/:project/vocabulary/**"
            render={({match}) => (<Redirect to={"/vocabulary?iri=" + encodeURIComponent(createVocabularyIri(match.params[0]))} />)}
        />

        <Route
            path="/projects/:project/search"
            render={({location, history}) => <SearchPage location={location} history={history} />}
        />
    </>
);

export default ProjectRoutes;
