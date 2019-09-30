import React from 'react';
import MetadataSearchResultList from "./MetadataSearchResultList";
import LinkedDataOverviewPage from "./common/LinkedDataOverviewPage";
import LinkedDataSearchResultsList from "./common/LinkedDataSearchResultsList";

const ResultsComponent = props => <LinkedDataSearchResultsList {...props} listComponent={MetadataSearchResultList} />;

export default () => <LinkedDataOverviewPage title="Metadata" resultsComponent={ResultsComponent} />;
