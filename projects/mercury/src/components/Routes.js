import React from 'react';
import {Redirect, Route} from "react-router-dom";

import Home from "./Home";
import Collections from "./collections/CollectionsPage";
import Notebooks from "./Notebooks";
import MetadataEntityPage from "./metadata/metadata/MetadataEntityPage";
import MetadataListPage from "./metadata/metadata/MetadataListPage";
import FilesPage from "./file/FilesPage";
import logout from "../services/logout";
import SearchPage from './search/SearchPage';
import VocabularyListPage from "./metadata/vocabulary/VocabularyListPage";
import VocabularyEntityPage from "./metadata/vocabulary/VocabularyEntityPage";
import {createMetadataIri, createVocabularyIri} from "../utils/linkeddata/metadataUtils";
import queryString from "query-string";

const routes = () => (
    <>
        <Route path="/" exact component={Home} />
        <Route path="/collections" exact component={Collections} />
        <Route path="/collections/:collection/:path(.*)?" component={FilesPage} />
        <Route path="/notebooks" exact component={Notebooks} />

        <Route
            path="/metadata"
            exact
            render={({location}) => {
                // React-router seems not to be able to directly match query parameters.
                // For that reason, we parse the query string ourselves
                const iriParam = queryString.parse(location.search).iri;
                return iriParam ? <MetadataEntityPage subject={decodeURIComponent(iriParam)} /> : <MetadataListPage />;
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
                return iriParam ? <VocabularyEntityPage subject={decodeURIComponent(iriParam)} /> : <VocabularyListPage />;
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
