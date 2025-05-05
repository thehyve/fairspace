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
          "values": ["https://example.com/ontology#indication_preferred_term_0354"]
        }
      ],
      "page": 1,
      "size": 1
    }
    `,
        sparqlQuery: `
    PREFIX demo: <https://fairspace.nl/demo#>
    PREFIX dct: <http://purl.org/dc/terms/>
    
    SELECT ?study ?title
    WHERE {
      ?study a demo:Study ;
        dct:title ?title ;
        demo:hasIndicationPreferredTerm <https://fairspace.nl/demo#indication_preferred_term_0354> .
    }
    `,
        answer: 'Yes, there are 3 studies related to indications of an abdominal injury: \n  1. Study X1000001, \n  2. Study X1000002, \n  3. Study X123'
    },
    'What is the most common imaging modality that is found in the uploaded studies?': {
        query: null,
        sparqlQuery: `
    PREFIX demo: <https://fairspace.nl/demo#>
    
    SELECT ?modality (COUNT(?modality) AS ?count)
    WHERE {
      ?study demo:hasImagingModality ?modality .
    }
    GROUP BY ?modality
    ORDER BY DESC(?count)
    LIMIT 1
    `,
        answer: 'The results show that the imaging modality with the most occurrences \nis "https://fairspace.nl/demo#imaging_modality_0019" with a count of 79.'
    },
    'I would like to see a location of data files for studies that were started after August last year with at least 100 subjects.':
        {
            query: `
    {
      "view": "DataFile",
      "filters": [
        {
            field: "Study_studyStartDate", 
            min: "2021-01-31T23:00:00.000Z", 
            max: null, 
            numericValue: false
        },
        {
            field: "Study_actualTotalNumberOfSubjects", 
            min: 500, 
            max: null, 
            numericValue: true
        }
      ],
      "page": 1,
      "size": 1
    }
    `,
            sparqlQuery: `
    PREFIX demo: <https://fairspace.nl/demo#>
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
            answer: 'There are 5 studies that were started after August last year with at least 100 subjects, \nwhich link to at least 1.2 mln files. Here are the locations of first 10 files: \n 1. /data00/Oyster_Exports/A9001140/A9001140/1002/10021013/24 month/3D/7/IMA9.dcm, \n 2. /some/file/path/X/IMA20.dcm, \n 3. /some/file/path/X/IMA23.dcm, \n 4. /some/file/path/X/IMA24.dcm, \n 5. /some/file/another/path/Y/IMA20.dcm'
        },
    'Can you find me all the studies where the images are according to the DICOM standard?': {
        answer: 'Unfortunately I could not find any information related to the DICOM standard \nin the available data.'
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
                        onClick={() => {
                            setResponseInfo('');
                            setInputQuery(question);
                        }}
                        style={{marginBottom: 10, textAlign: 'left'}}
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
