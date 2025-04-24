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
    'Which studies are on the gut microbiome?': {
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
        answer: 'The studies on the gut microbiome are: 1. Study 1, 2. Study 2, 3. Study 3'
    },
    'Which studies have more than 10 samples?': {
        query: `
    {
      "view": "Study",
      "filters": [
        {
          "field": "Study_samples",
          "gt": 10
        }
      ],
      "page": 1,
      "size": 1
    }
    `,
        answer: 'The studies with more than 10 samples are: 1. Study A, 2. Study B, 3. Study C'
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
        <Grid
            container
            justifyContent="center"
            spacing="10"
            style={{paddingTop: 60, paddingBottom: 60, height: '100%'}}
        >
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
