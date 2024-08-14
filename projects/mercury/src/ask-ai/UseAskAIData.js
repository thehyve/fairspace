import {useEffect, useState} from 'react';
import AskAIAPI from './AskAIAPI';
import {handleHttpError} from '../common/utils/httpUtils';

type AskAIResponse = {
    searchResults: any[],
    conversation: any,
    conversationId: string,
    reply: any
};

export const useAskAIData = initQuery => {
    const [query, setQuery] = useState(initQuery);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [messages, setMessages] = useState([]);
    const [responseInfo, setResponseInfo] = useState('');
    const [responseDocuments, setResponseDocuments] = useState([]);
    const [conversationId, setConversationId] = useState('');
    const [conversationHistory, setConversationHistory] = useState([]);
    const [restoreChatStatus, setRestoreChatStatus] = useState(false);

    const askAIAPI = new AskAIAPI();

    const getAllConversationHistory = () => {
        setLoading(true);
        askAIAPI
            .getAllConversations()
            .then(({data}) => {
                if (data && data.length > 0) {
                    data.sort((a, b) => new Date(b.start) - new Date(a.start));

                    if (JSON.stringify(data) !== JSON.stringify(conversationHistory)) {
                        setConversationHistory(data);
                    }
                }
                // setMessages(data);
            })
            .catch(() => {
                handleHttpError('Error retrieving chat history.');
                // setError(e);
            })
            .finally(() => setLoading(false));
    };

    const fetchQueryResponse = searchQuery => {
        setLoading(true);
        askAIAPI
            .chat(searchQuery, conversationId)
            .then(({data}: {data: AskAIResponse}) => {
                setResponseDocuments(data.searchResults);
                setMessages(data.conversation.messages);
                setConversationId(data.conversationId);
            })
            .catch(e => {
                console.error('Error sending query', e);
                setError(e);
            })
            .finally(() => setLoading(false));
    };

    const deleteChat = id => {
        setLoading(true);
        askAIAPI
            .deleteChat(id)
            .then(() => {
                setMessages([]);
                setResponseDocuments([]);
                setConversationId('');
            })
            .catch(e => {
                console.error('Error deleting chat', e);
                setError(e);
            })
            .finally(() => setLoading(false));
    };

    const processResponseDocuments = data => {
        const documents = [];
        if (data.searchResults) {
            data.searchResults.forEach(result =>
                result.document.derivedStructData.extractive_answers.forEach(element => {
                    documents.push({title: result.document.derivedStructData.title, content: element.content});
                })
            );
        }
        setResponseDocuments(documents);
    };

    const processHistoryResponseMessages = data => {
        const id = data.conversation ? data.conversation.conversationId : data.conversationId;
        const oldMessages = data.conversation ? data.conversation.messages : data.messages;
        const oldResponseMessage = data.reply ? data.reply.summary.summaryText : '';

        setResponseInfo(oldResponseMessage);
        setConversationId(id);
        setMessages(oldMessages);
        askAIAPI.getConversation(id).then(conversation => processResponseDocuments(conversation));
    };

    const processResponseMessages = (data: AskAIResponse) => {
        const newMessages = data.conversation?.messages || data.messages;
        const id = data.conversation?.conversationId || data.conversationId;

        if (!newMessages?.length) {
            setResponseInfo('No chat messages found.');
            setResponseDocuments([]);
        } else if (data.reply?.summary?.summaryText.includes('not enough information')) {
            setResponseInfo('Apologies, there is not enough information available to answer this query.');
            setConversationId(id);
            setMessages(newMessages);
        } else if (
            ['not enough information', "I don't know what you mean", "not sure what you're asking about"].some(text =>
                data.reply?.summary?.summaryText.includes(text)
            )
        ) {
            setResponseInfo('');
            setConversationId(id);
            setMessages(newMessages);
        } else {
            setResponseInfo('');
            setConversationId(id);
            setMessages(newMessages);
            processResponseDocuments(data);
        }
    };

    const prepareRestoreChat = id => {
        setLoading(true);
        setQuery('');
        setResponseDocuments([]);
        setMessages([]);
        setConversationId(id);
        setRestoreChatStatus(true);
        getAllConversationHistory();
    };

    const clearChat = () => {
        setQuery('');
        setResponseInfo('');
        setMessages([]);
        setResponseDocuments([]);
        setConversationId('');
        getAllConversationHistory();
    };

    const processSearchQueryChange = newQuery => {
        if (newQuery !== query) {
            if (responseInfo !== '') {
                setResponseInfo('');
                setResponseDocuments([]);
            }
            setQuery(newQuery);
        }
    };

    const handleSearchError = e => {
        setResponseInfo(e);
        setLoading(false);
    };

    const performSearch = () => {
        if (conversationId === '') {
            return askAIAPI.search(query);
        }

        return askAIAPI.chat(query, conversationId);
    };

    const prepareFetchSearch = () => {
        setLoading(true);
        setResponseInfo('');

        if (query === '') {
            return;
        }

        performSearch()
            .then(processResponseMessages)
            .then(() => setLoading(false))
            .catch(() => {
                handleHttpError('Connection error.');
                handleSearchError('Ask AI search is not available at the moment');
            });
    };

    const restoreChat = id => {
        askAIAPI
            .getHistory(id)
            .then(processHistoryResponseMessages)
            .then(() => setLoading(false))
            .catch(() => handleHttpError('Error retrieving chat history.'));
    };

    useEffect(() => {
        getAllConversationHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationHistory]);

    useEffect(() => {
        if (restoreChatStatus) {
            restoreChat(conversationId);
        }
        setRestoreChatStatus(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    return {
        query,
        setQuery,
        loading,
        error,
        responseDocuments,
        messages,
        responseInfo,
        conversationId,
        restoreChatStatus,
        restoreChat,
        setRestoreChatStatus,
        clearChat,
        prepareFetchSearch,
        prepareRestoreChat,
        processSearchQueryChange,
        getAllConversationHistory,
        fetchQueryResponse,
        deleteChat
    };
};
