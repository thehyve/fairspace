import React, {useContext, useState} from 'react';
import {Button, Grid} from '@mui/material';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import UserContext from '../users/UserContext';
import AskAIChat from './AskAIChat';
import {getSearchQueryFromString} from '../search/searchUtils';
// import AskAIHistory from './AskAIHistory';
import usePageTitleUpdater from '../common/hooks/UsePageTitleUpdater';
import {useAskAIData} from './UseAskAIData';

const questionQueryAnswer = {
    'Are there some studies related to injuries of liver, stomach, intestines etc?': {
        query: `
    {
      "view": "Study",
      "filters": [
        {
          "field": "Study_indicationPreferredTerm",
          "values": ["https://example.com/ontology#indication_preferred_term_0226"]
        }
      ],
      "page": 1,
      "size": 1
    }
    `,
        sparqlQuery: `
    PREFIX example: <https://example.com/ontology#>
    PREFIX fs: <https://fairspace.nl/ontology#>

    SELECT ?study ?title
    WHERE {
      ?study a <https://example.com/ontology#Study> ;
             <http://purl.org/dc/terms/title> ?title ;
             <https://example.com/ontology#hasIndicationPreferredTerm> ?indicationPreferredTerm .
      FILTER (?indicationPreferredTerm = "https://example.com/ontology#indication_preferred_term_0226")
    }
        `,
        answer: 'The studies with more than 10 samples are: 1. Study A, 2. Study B, 3. Study C'
    },
    'What is the average planned number of subjects across all studies?': {
        query: null,
        sparqlQuery: `
    PREFIX example: <https://example.com/ontology#>
    PREFIX fs: <https://fairspace.nl/ontology#>

    SELECT DISTINCT ?study ?label
    WHERE {
        ?study a example:Study .
        ?study fs:label ?label .
        ?study example:description ?description .
        FILTER(CONTAINS(LCASE(?description), "gut microbiome"))
        FILTER NOT EXISTS { ?study fs:dateDeleted ?anyDateDeleted }
    }
    LIMIT 10
    `,
        answer: 'The studies on the gut microbiome are: 1. Study 1, 2. Study 2, 3. Study 3'
    },
    'I would like to see a location of data files for studies that were completed after August last year with at least 100 subjects.':
        {
            query: `
    {
      "view": "Study",
      "filters": [
        {
          "field": "Study_description",
          "prefix": "gut microbiome"
        }
      ],
      "page": 1,
      "size": 1
    }
    `,
            sparqlQuery: `
    PREFIX demo: <https://demo.nl/test#>
    PREFIX dct: <http://purl.org/dc/terms/>

            SELECT ?fileName
    WHERE {
      ?study a demo:Study ;
             dct:title ?title ;
             demo:hasStudyStartDate ?studyStartDate ;
             demo:hasDuration ?studyDuration ;
             demo:hasPlannedNumberOfSubjects ?plannedNumberOfSubjects .
      ?dataFile demo:dataFileRelatedToStudy ?study ;
                demo:hasFileName ?fileName .

      FILTER (?plannedNumberOfSubjects >= 100)
      FILTER (
        (YEAR(?studyStartDate) * 12 + MONTH(?studyStartDate) + ?studyDuration) > (2024 * 12 + 8)
      )
    }
    LIMIT 10
    `,
            answer: 'The studies on the gut microbiome are: 1. Study 1, 2. Study 2, 3. Study 3'
        }
};

const AskAIPage = props => {
    const {currentUser, location: {search} = ''} = props;
    const initQuery = getSearchQueryFromString(search);
    const {views} = useContext(MetadataViewContext);
    const canViewMetadata = currentUser && currentUser.canViewPublicMetadata && views && views.length > 0;
    const {query, setQuery, responseDocuments, messages, loading, responseInfo, clearChat, setResponseInfo} =
        useAskAIData(initQuery);

    usePageTitleUpdater('Ask AI');

    const [inputQuery, setInputQuery] = useState(query);

    return (
        <Grid container justifyContent="center" spacing={3} style={{paddingTop: 60, paddingBottom: 60, height: '100%'}}>
            <Grid item xs={8}>
                {canViewMetadata && (
                    <AskAIChat
                        query={query}
                        setQuery={setQuery}
                        responseDocuments={responseDocuments}
                        messages={messages}
                        loading={loading}
                        responseInfo={responseInfo}
                        clearChat={clearChat}
                        setInputQuery={setInputQuery}
                        inputQuery={inputQuery}
                        questionQueryAnswer={questionQueryAnswer}
                    />
                )}
            </Grid>
            <Grid item xs={4}>
                <h1>Example questions</h1>
                {Object.keys(questionQueryAnswer).map(question => (
                    <Button
                        key={question}
                        variant="contained"
                        size="small"
                        onClick={() => {
                            setResponseInfo('');
                            setInputQuery(question);
                        }}
                        style={{marginBottom: 10}}
                    >
                        {question}
                    </Button>
                ))}
            </Grid>
        </Grid>
    );
};

const ContextualAskAIPage = props => {
    const {currentUser} = useContext(UserContext);

    return <AskAIPage currentUser={currentUser} {...props} />;
};

export default ContextualAskAIPage;
