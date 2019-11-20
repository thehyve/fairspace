import React from 'react';
import {Redirect, Route} from "react-router-dom";
import {logout} from '@fairspace/shared-frontend';

import Config from "../common/services/Config";
import Home from "../home/Home";
import Collections from "../collections/CollectionsPage";
import Notebooks from "../notebooks/Notebooks";
import FilesPage from "../file/FilesPage";
import SearchPage from '../search/SearchPage';
import {createMetadataIri, createVocabularyIri} from "../common/utils/linkeddata/metadataUtils";
import {MetadataWrapper, VocabularyWrapper} from '../metadata/LinkedDataWrapper';
import LinkedDataEntityPage from "../metadata/common/LinkedDataEntityPage";
import MetadataOverviewPage from "../metadata/MetadataOverviewPage";
import VocabularyOverviewPage from "../metadata/VocabularyOverviewPage";
import useSubject from '../common/hooks/UseSubject';
import LinkedDataMetadataProvider from "../metadata/LinkedDataMetadataProvider";
import {VocabularyProvider} from '../metadata/VocabularyContext';
import {MetadataProvider} from '../metadata/MetadataContext';

const routes = () => (
    <>
        <Route path="/" exact component={Home} />

        <Route
            path="/collections"
            exact
            render={() => (
                <VocabularyProvider>
                    <MetadataProvider>
                        <LinkedDataMetadataProvider>
                            <Collections />
                        </LinkedDataMetadataProvider>
                    </MetadataProvider>
                </VocabularyProvider>
            )}
        />

        <Route
            path="/collections/:collection/:path(.*)?"
            render={(props) => (
                <VocabularyProvider>
                    <MetadataProvider>
                        <LinkedDataMetadataProvider>
                            <FilesPage {...props} />
                        </LinkedDataMetadataProvider>
                    </MetadataProvider>
                </VocabularyProvider>
            )}
        />

        <Route path="/notebooks" exact component={Notebooks} />

        <Route
            path="/metadata"
            exact
            render={() => {
                const subject = useSubject();

                return (
                    <VocabularyProvider>
                        <MetadataProvider>
                            <MetadataWrapper>
                                {subject ? <LinkedDataEntityPage title="Metadata" subject={subject} /> : <MetadataOverviewPage />}
                            </MetadataWrapper>
                        </MetadataProvider>
                    </VocabularyProvider>
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
                const subject = useSubject();

                return (
                    <VocabularyProvider>
                        <VocabularyWrapper>
                            {subject ? <LinkedDataEntityPage title="Vocabulary" subject={subject} /> : <VocabularyOverviewPage />}
                        </VocabularyWrapper>
                    </VocabularyProvider>
                );
            }}
        />

        <Route
            /* This route redirects a metadata iri which is entered directly to the metadata editor */
            path="/vocabulary/**"
            render={({match}) => (<Redirect to={"/vocabulary?iri=" + encodeURIComponent(createVocabularyIri(match.params[0]))} />)}
        />

        <Route path="/login" render={() => {window.location.href = '/login';}} />
        <Route
            path="/logout"
            render={() => logout({
                logoutUrl: Config.get().urls.logout,
                jupyterhubUrl: Config.get().urls.jupyterhub
            })}
        />
        <Route
            path="/search"
            render={({location, history}) => <SearchPage location={location} history={history} />}
        />
    </>
);

export default routes;
