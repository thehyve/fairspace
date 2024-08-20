import React, {useContext} from 'react';

import {Grid} from '@mui/material';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import UserContext from '../users/UserContext';
import AskAIChat from './AskAIChat';
import {getSearchQueryFromString} from '../search/searchUtils';
import AskAIHistory from './AskAIHistory';
import usePageTitleUpdater from '../common/hooks/UsePageTitleUpdater';
import {useAskAIData} from './UseAskAIData';

const AskAIPage = props => {
    const {currentUser, location: {search} = ''} = props;
    const initQuery = getSearchQueryFromString(search);
    const {views} = useContext(MetadataViewContext);
    const canViewMetadata = currentUser && currentUser.canViewPublicMetadata && views && views.length > 0;
    const {
        query,
        setQuery,
        conversationHistory,
        conversationId,
        responseDocuments,
        messages,
        loading,
        historyLoading,
        responseInfo,
        deleteChat,
        restoreChat,
        clearChat
    } = useAskAIData(initQuery);

    usePageTitleUpdater('Ask AI');

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
                    />
                )}
            </Grid>
            <Grid item xs={4}>
                <AskAIHistory
                    conversationHistory={conversationHistory}
                    conversationId={conversationId}
                    restoreChat={restoreChat}
                    deleteChat={deleteChat}
                    historyLoading={historyLoading}
                />
            </Grid>
        </Grid>
    );
};

const ContextualAskAIPage = props => {
    const {currentUser} = useContext(UserContext);

    return <AskAIPage currentUser={currentUser} {...props} />;
};

export default ContextualAskAIPage;
