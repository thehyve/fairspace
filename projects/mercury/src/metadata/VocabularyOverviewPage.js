import React from 'react';
import LinkedDataOverviewPage from "./common/LinkedDataOverviewPage";
import VocabularySearchResultList from "./VocabularySearchResultList";
import LinkedDataSearchResultsList from "./common/LinkedDataSearchResultsList";
import VocabularyGraph from "./VocabularyGraph";

const ResultsComponent = ({query, selectedTypes, showGraph, ...otherProps}) => (
    (showGraph)
        ? <VocabularyGraph />
        : (
            <LinkedDataSearchResultsList
                query={query}
                selectedTypes={selectedTypes}
                listComponent={VocabularySearchResultList}
                {...otherProps}
            />
        )
);

export default () => (
    <LinkedDataOverviewPage
        title="Vocabulary"
        showGraphSelection
        resultsComponent={ResultsComponent}
    />
);
