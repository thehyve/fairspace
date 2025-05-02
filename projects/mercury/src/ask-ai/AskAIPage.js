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
    'How many studies are there in the database?': {
        title: 'studies in database',
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
        PREFIX : <https://fairspace.nl/pfizer#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT (COUNT(?subject) as ?count) WHERE {
        ?subject a :Study .
        }
        `,
        answer: 'The results from the knowledge graph show that there are 15 instances of studies.'
    },
    'how many studies in the therapeutic area with label ONCOLOGY or HEMATOLOGY are there?': {
        title: 'studies in therapeutic area',
        query: null,
        sparqlQuery: `
        PREFIX : <https://fairspace.nl/pfizer#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT (COUNT(?study) as ?count) WHERE {
        ?study a :Study ;
                :TherapeuticArea ?therapeuticArea .
        ?therapeuticArea rdfs:label ?label .
        FILTER(?label = "ONCOLOGY" || ?label = "HEMATOLOGY")
        }
    `,
        answer: 'The query is counting the number of studies in the knowledge graph related to Oncology or Hematology. The result is 0 studies found.'
    },
    'Whats the most common imaging modality that is found in the uploaded studies?': {
        title: 'most common imaging modality',
        query: null,
        sparqlQuery: `
        PREFIX fs: <https://fairspace.nl/pfizer#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?modality (COUNT(?modality) AS ?count)
        WHERE {
        ?study fs:hasImagingModality ?modality .
        }
        GROUP BY ?modality
        ORDER BY DESC(?count)
        LIMIT 1
    `,
        answer: 'The results show that the imaging modality with the most occurrences is "https://fairspace.nl/pfizer#imaging_modality_0019" with a count of 79.'
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
                        style={{marginRight: 10, marginBottom: 10}}
                    >
                        {questionQueryAnswer[question].title}
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
