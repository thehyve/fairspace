import React from 'react';
import {Redirect, Route} from "react-router-dom";
import queryString from "query-string";

import Home from "./Home";
import Collections from "./collections/CollectionsPage";
import Notebooks from "./Notebooks";
import MetadataEntityPage from "./metadata/metadata/MetadataEntityPage";
import FilesPage from "./file/FilesPage";
import logout from "../services/logout";
import SearchPage from './search/SearchPage';
import VocabularyEntityPage from "./metadata/vocabulary/VocabularyEntityPage";
import {createMetadataIri, createVocabularyIri} from "../utils/linkeddata/metadataUtils";
import {MetadataWrapper, VocabularyWrapper} from './metadata/LinkedDataWrapper';
import LinkedDataListPage from './metadata/common/LinkedDataListPage';

const routes = () => (
    <>
        <Route path="/" exact component={Home} />

        <Route
            path="/collections"
            exact
            render={({location}) => (
                <MetadataWrapper location={location}>
                    <Collections />
                </MetadataWrapper>
            )}
        />

        <Route
            path="/collections/:collection/:path(.*)?"
            render={(props) => (
                <MetadataWrapper location={props.location}>
                    <FilesPage {...props} />
                </MetadataWrapper>
            )}
        />

        <Route path="/notebooks" exact component={Notebooks} />

        <Route
            path="/metadata"
            exact
            render={({location}) => {
                // React-router seems not to be able to directly match query parameters.
                // For that reason, we parse the query string ourselves
                const iriParam = queryString.parse(location.search).iri;
                const component = iriParam ? <MetadataEntityPage subject={decodeURIComponent(iriParam)} /> : <LinkedDataListPage />;
                return (
                    <MetadataWrapper location={location}>
                        {component}
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
            render={({location}) => {
                // React-router seems not to be able to directly match query parameters.
                // For that reason, we parse the query string ourselves
                const iriParam = queryString.parse(location.search).iri;
                const component = iriParam ? <VocabularyEntityPage subject={decodeURIComponent(iriParam)} /> : <LinkedDataListPage />;

                return (
                    <VocabularyWrapper location={location}>
                        {component}
                    </VocabularyWrapper>
                );
            }}
        />

        <Route
            /* This route redirects a metadata iri which is entered directly to the metadata editor */
            path="/vocabulary/**"
            render={({match}) => (<Redirect to={"/vocabulary?iri=" + encodeURIComponent(createVocabularyIri(match.params[0]))} />)}
        />

        <Route path="/login" render={() => {window.location.href = '/login';}} />
        <Route path="/logout" render={logout} />
        <Route path="/search" component={SearchPage} />
    </>
);

export default routes;
