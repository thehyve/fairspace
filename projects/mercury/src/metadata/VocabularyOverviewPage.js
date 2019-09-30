import React from 'react';
import LinkedDataOverviewPage from "./common/LinkedDataOverviewPage";
import VocabularySearchResultList from "./VocabularySearchResultList";
import LinkedDataSearchResultsList from "./common/LinkedDataSearchResultsList";
import VocabularyGraph from "./VocabularyGraph";

const ResultsComponent = ({query, selectedTypes, ...otherProps}) => {
    const noQuery = !query || query === '*';
    const noSelectedTypes = !selectedTypes || selectedTypes.length === 0;

    return (noQuery && noSelectedTypes)
        ? <VocabularyGraph />
        : (
            <LinkedDataSearchResultsList
                query={query}
                selectedTypes={selectedTypes}
                listComponent={VocabularySearchResultList}
                {...otherProps}
            />
        );
};

export default () => <LinkedDataOverviewPage title="Vocabulary" resultsComponent={ResultsComponent} />;
