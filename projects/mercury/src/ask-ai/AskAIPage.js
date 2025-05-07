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
        answer:
            'The query found that there are 2 studies related to indications of an abdominal injury \n' +
            'in the knowledge graph. It retrieved the following studies and labels: \n' +
            ' - Study: https://fairspace.example/study/a4ab140d-4e0e-4fd5-bc4f-4355aa4ee701,\n' +
            '   Label: 84f8d787-3974-418c-b12a-55c6367c1e34 \n' +
            ' - Study: https://fairspace.example/study/431178ec-1b75-4a29-861d-e248bcc9c47c,\n' +
            '   Label: 40659394-a12f-4407-97a3-fd68da19a1c3' +
            '\n\nThe query to ClinicalTrials.gov API found that there are 19706 studies \n' +
            'in ClinicalTrials.gov database that fit the criteria.',
        ctAnswer: `{
    "totalCount": 19706,
    "studies": [{
        "protocolSection": {
            "identificationModule": {
                "nctId":"NCT00059267",
                "orgStudyIdInfo": {
                    "id":"NIH HBV-OLT (completed)"
                },
                "secondaryIdInfos": [{
                    "id":"U01DK057577",
                    "type":"NIH",
                    "link":"https://reporter.nih.gov/quickSearch/U01DK057577"
                }],
                "organization": {
                    "fullName":"National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)",
                    "class":"NIH"
                },
                "briefTitle":"Prevention of Recurrent Hepatitis B After Liver Transplantation",
                "officialTitle":"Prevention of Recurrent Hepatitis B After Liver Transplantation"
            },
            "statusModule": {
                "statusVerifiedDate":"2024-11",
                "overallStatus":"COMPLETED",
                "expandedAccessInfo":{"hasExpandedAccess":false},
                "startDateStruct":{"date":"2001-03","type":"ACTUAL"},
                "primaryCompletionDateStruct":{"date":"2007-11","type":"ACTUAL"},
                "completionDateStruct":{"date":"2007-11","type":"ACTUAL"},
                "studyFirstSubmitDate":"2003-04-22",
                "studyFirstSubmitQcDate":"2003-04-22",
                "studyFirstPostDateStruct":{"date":"2003-04-23","type":"ESTIMATED"},
                "lastUpdateSubmitDate":"2024-11-14",
                "lastUpdatePostDateStruct":{"date":"2024-11-15","type":"ACTUAL"}
            },
            "sponsorCollaboratorsModule":{
                "responsibleParty":{"type":"SPONSOR"},
                "leadSponsor": {
                    "name":"National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK)",
                    "class":"NIH"},
                    "collaborators":[{"name":"University of Michigan","class":"OTHER"}]
                },
                "descriptionModule": {
                    "briefSummary":"Hepatitis B accounts for approximately 5000 deaths per year ... "
                },
                "conditionsModule": {
                    "conditions": ["Hepatitis B","Cirrhosis","Acute Liver Failure","Hepatocellular Carcinoma"]
                },
                "designModule":{"studyType":"OBSERVATIONAL",
                "designInfo":{"observationalModel":"COHORT","timePerspective":"PROSPECTIVE"},
                "enrollmentInfo":{"count":317,"type":"ACTUAL"}
            },
            "armsInterventionsModule":{"interventions":[{"type":"DRUG","name":"HBIG, Epivir, Hepsera"}]},
            "eligibilityModule":{}
            ...
    `,
        ctQuery:
            'curl -X GET "https://clinicaltrials.gov/api/v2/studies?format=json&query.cond=%28intestine+OR+stomach+OR+liver%29&filter.overallStatus=COMPLETED&postFilter.overallStatus=COMPLETED&countTotal=true" \n -H "accept: application/json" \n'
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
          "field": "Study_studyStartDate",
          "min": "2021-01-31T23:00:00.000Z",
          "max": null,
          "numericValue": false
        },
        {
          "field": "Study_actualTotalNumberOfSubjects",
          "min": 500,
          "max": null,
          "numericValue": true
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
            answer: 'The query found 5 studies that were started after August last year with at least 100 subjects, \nwhich link to at least 1.2 mln files. Here are the locations of first 10 files: \n 1. /data00/Oyster_Exports/A9001140/A9001140/1002/10021013/24 month/3D/7/IMA9.dcm, \n 2. /some/file/path/X/IMA20.dcm, \n 3. /some/file/path/X/IMA23.dcm, \n 4. /some/file/path/X/IMA24.dcm, \n 5. /some/file/another/path/Y/IMA20.dcm'
        },
    'Can you find me all the studies where the images are according to the DICOM standard?': {
        answer:
            'The query found 10 studies that are linked to data files with file type labeled "DICOM" \nin the knowledge graph.' +
            'It retrieved the following studies and labels: \n' +
            '  - Study: https://fairspace.example/study/a4ab140d-4e0e-4fd5-bc4f-4355aa4ee701,\n    Label: 84f8d787-3974-418c-b12a-55c6367c1e34\n' +
            '  - Study: https://fairspace.example/study/431178ec-1b75-4a29-861d-e248bcc9c47c,\n    Label: 40659394-a12f-4407-97a3-fd68da19a1c3\n' +
            '  - Study: https://fairspace.example/study/09a0ef63-a635-45f4-a690-495400a71a8b,\n    Label: 27c0c422-610f-42e5-81bd-928dfbce3609\n' +
            '  - Study: https://fairspace.example/study/4287554d-58ad-4eb4-aec7-59f36c57490d,\n    Label: 86de3e47-1406-4ab6-bd40-14f4511e65f7\n' +
            '  - Study: https://fairspace.example/study/3c653d51-cd68-4082-a646-579f977a2c3a,\n    Label: 2e91ae9f-cfc9-48d6-974d-2dc9f321f356\n' +
            '  - Study: https://fairspace.example/study/fa41426d-a933-4c63-87ef-00a106aeb8eb,\n    Label: 7c2e46bc-0e31-45e8-8b1a-0b44b709ada5\n' +
            '  - Study: https://fairspace.example/study/1e61a589-71be-4da6-b052-ef155200c236,\n    Label: 17502022-9a18-4d3f-b543-88882eb6bc3a\n' +
            '  - Study: https://fairspace.example/study/83e17e40-693d-4282-9b25-dce8636f8acd,\n    Label: 5fbbecc4-dbd9-44ed-a8b4-8c5986764e7f\n' +
            '  - Study: https://fairspace.example/study/8cad2f6b-ed34-4193-b205-fc48748b7b05,\n    Label: ecad8e49-3a7a-4fd9-ab90-d9424a112219\n' +
            '  - Study: https://fairspace.example/study/eb357218-e999-4a9a-b8d8-ad4fff03801e,\n    Label: 793baa92-abf5-448e-ab2d-5440b7ed260d',
        sparqlQuery: `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX demo: <https://fairspace.nl/demo#>
        SELECT ?study
        WHERE {
          ?study a demo:Study .
          ?study demo:hasDataFile ?dataFile .
          ?dataFile demo:FileType ?fileType .
          ?fileType rdfs:label "DICOM" .
        }
        `,
        query: `
        {
          "view": "Study",
          "filters": [
            {
                "field": "DataFile_fileType", 
                "values": ["https://fairspace.nl/demo#file_type_0001"]
            }
          ],
          "includeJoinedViews": true,
          "page": 1,
          "size": 1
        }`
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
