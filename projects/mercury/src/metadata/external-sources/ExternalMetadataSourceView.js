import React, {useContext, useEffect} from 'react';
import {useHistory} from "react-router-dom";
import withStyles from "@mui/styles/withStyles";

import {getLocationContextFromString, getMetadataViewNameFromString} from "../../search/searchUtils";
import LoadingInlay from "../../common/components/LoadingInlay";
import MessageDisplay from "../../common/components/MessageDisplay";
import {MetadataView} from "../views/MetadataView";
import {useExternalMetadataSource} from "./UseExternalMetadataSource";
import {useExternalMetadataSourceViewFacets} from "./UseExternalMetadataSourceViewFacets";
import {getMetadataViewsPath, RESOURCES_VIEW} from "../views/metadataViewUtils";
import styles from "../views/MetadataView.styles";
import ExternalMetadataSourceContext from "./ExternalMetadataSourceContext";
import type {Match} from "../../types";
import type {ExternalMetadataSource} from "./externalMetadataSourceUtils";
import {getExternalMetadataSourcePathPrefix} from "./externalMetadataSourceUtils";

type ContextualExternalMetadataViewProperties = {
    match: Match;
    location: Location;
    classes: any;
};

type ExternalMetadataViewProperties = ContextualExternalMetadataViewProperties & {
    externalMetadataSources: ExternalMetadataSource[];
    history: History;
}

const ExternalMetadataSourceView = (props: ExternalMetadataViewProperties) => {
    const {externalMetadataSources, match, history} = props;

    const source: ExternalMetadataSource = externalMetadataSources.find(s => s.name === match.params.source);
    const metadataContext = useExternalMetadataSource(source);
    const {views = [], loading, error} = metadataContext;
    const {facets = [], facetsLoading, facetsError, initialLoad} = useExternalMetadataSourceViewFacets(source);
    const currentViewName = getMetadataViewNameFromString(window.location.search);
    const locationContext = getLocationContextFromString(window.location.search);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {initialLoad();}, []);

    if ((error && error.message)) {
        return <MessageDisplay message={error.message} />;
    }
    if (facetsError && facetsError.message) {
        return <MessageDisplay message={facetsError.message} />;
    }
    if (loading || facetsLoading) {
        return <LoadingInlay />;
    }

    if (views.length < 1) {
        return <MessageDisplay message="No metadata view found." />;
    }

    const handleViewChangeRedirect = (viewName, viewPath) => {
        if (viewName) {
            history.push(getMetadataViewsPath(viewName, viewPath));
        }
    };

    return (
        <MetadataView
            {...props}
            facets={facets}
            views={views}
            locationContext={currentViewName === RESOURCES_VIEW && locationContext}
            currentViewName={currentViewName}
            metadataContext={metadataContext}
            handleViewChangeRedirect={handleViewChangeRedirect}
            pathPrefix={getExternalMetadataSourcePathPrefix(source.name)}
        />
    );
};

const ContextualExternalMetadataSourceView = (props: ContextualExternalMetadataViewProperties) => {
    const {externalMetadataSources = []} = useContext(ExternalMetadataSourceContext);
    const history = useHistory();

    return (
        <ExternalMetadataSourceView
            {...props}
            externalMetadataSources={externalMetadataSources}
            history={history}
        />
    );
};
export default withStyles(styles)(ContextualExternalMetadataSourceView);
