import React from 'react';
import MetadataSearchResultList from "./MetadataSearchResultList";
import LinkedDataOverviewPage from "./common/LinkedDataOverviewPage";
import LinkedDataSearchResultsList from "./common/LinkedDataSearchResultsList";

export default () => <LinkedDataOverviewPage title="Metadata" resultsComponent={props => LinkedDataSearchResultsList({...props, listComponent: MetadataSearchResultList})} />;
