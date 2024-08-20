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
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState();
    const [messages, setMessages] = useState([]);
    const [responseInfo, setResponseInfo] = useState('');
    const [responseDocuments, setResponseDocuments] = useState([]);
    const [conversationId, setConversationId] = useState('');
    const [conversationHistory, setConversationHistory] = useState([]);

    const askAIAPI = new AskAIAPI();

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

    const search = () => {
        setResponseInfo('');
        if (query === '') {
            return;
        }
        setLoading(true);
        performSearch()
            .then(processResponseMessages)
            .then(() => setLoading(false))
            .catch(() => {
                handleHttpError('Connection error.');
                handleSearchError('Ask AI search is not available at the moment');
            })
            .finally(() => setLoading(false));
    };

    const getAllConversationHistory = () => {
        setHistoryLoading(true);
        askAIAPI
            .getAllConversations()
            .then(data => {
                if (data && data.length > 0) {
                    data.sort((a, b) => new Date(b.start) - new Date(a.start));

                    if (JSON.stringify(data) !== JSON.stringify(conversationHistory)) {
                        setConversationHistory(data);
                    }
                }
            })
            .catch(() => {
                handleHttpError('Error retrieving chat history.');
            })
            .finally(() => setHistoryLoading(false));
    };

    const deleteChat = id => {
        setHistoryLoading(true);
        askAIAPI
            .deleteChat(id)
            .then(() => {
                setMessages([]);
                setResponseDocuments([]);
                setConversationId('');
                getAllConversationHistory();
            })
            .catch(e => {
                console.error('Error deleting chat', e);
                setError(e);
            })
            .finally(() => setHistoryLoading(false));
    };

    const clearChat = () => {
        setQuery('');
        setResponseInfo('');
        setMessages([]);
        setResponseDocuments([]);
        setConversationId('');
        getAllConversationHistory();
    };

    const restoreChat = id => {
        setLoading(true);
        setQuery('');
        setResponseDocuments([]);
        setMessages([]);
        setConversationId(id);
        askAIAPI
            .getHistory(id)
            .then(processHistoryResponseMessages)
            .catch(() => {
                handleHttpError('Error retrieving chat history.');
                handleSearchError('Error retrieving chat history.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        getAllConversationHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        search();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return {
        query,
        setQuery,
        loading,
        historyLoading,
        error,
        responseDocuments,
        messages,
        responseInfo,
        conversationId,
        conversationHistory,
        restoreChat,
        clearChat,
        deleteChat
    };
};
