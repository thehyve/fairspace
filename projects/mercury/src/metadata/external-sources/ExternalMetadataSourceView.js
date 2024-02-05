import React, {useContext} from 'react';
import LoadingInlay from "../../common/components/LoadingInlay";
import MessageDisplay from "../../common/components/MessageDisplay";
import MetadataView from "../views/MetadataView";
import ExternalMetadataSourceContext from "./ExternalMetadataSourceContext";
import type {ExternalMetadataSource} from "./externalMetadataSourceUtils";
import {getExternalMetadataSourcePathPrefix} from "./externalMetadataSourceUtils";
import MetadataAPIPathContext from "../common/MetadataAPIPathContext";
import {MetadataViewProvider} from "../views/MetadataViewContext";
import {MetadataViewAPI} from "../views/MetadataViewAPI";
import {MetadataViewFacetsProvider} from "../views/MetadataViewFacetsContext";
import {VocabularyProvider} from "../vocabulary/VocabularyContext";
import LinkedDataMetadataProvider from "../LinkedDataMetadataProvider";

export type ExternalMetadataSourceViewProperties = {
    classes: any;
    match: any;
}
const ExternalMetadataSourceView = (props: ExternalMetadataSourceViewProperties) => {
    const {match} = props;
    const {externalMetadataSources = [], loading, error} = useContext(ExternalMetadataSourceContext);

    if ((error && error.message)) {
        return <MessageDisplay message={error.message} />;
    }
    if (loading) {
        return <LoadingInlay />;
    }

    const source: ExternalMetadataSource = externalMetadataSources.find(s => s.name === match.params.source);

    return (
        <MetadataAPIPathContext.Provider value={{path: source.path}}>
            <MetadataViewProvider metadataViewAPI={new MetadataViewAPI(source.path)} sourceName={source.name}>
                <MetadataViewFacetsProvider>
                    <VocabularyProvider>
                        <LinkedDataMetadataProvider>
                            <MetadataView
                                {...props}
                                pathPrefix={getExternalMetadataSourcePathPrefix(source.name)}
                            />
                        </LinkedDataMetadataProvider>
                    </VocabularyProvider>
                </MetadataViewFacetsProvider>
            </MetadataViewProvider>
        </MetadataAPIPathContext.Provider>
    );
};
export default ExternalMetadataSourceView;
