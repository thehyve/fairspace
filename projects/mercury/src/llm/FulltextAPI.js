import axios from 'axios';
import {extractJsonData, handleHttpError} from '../common/utils/httpUtils';

export const HEADERS = {'Content-Type': 'application/json', Accept: 'application/json'};

/**
 * Search for resources based on name or description, given query as a simple text.
 */
class FulltextAPI {
    remoteURL = '/api/aisearch/';

    // Perform a single search, just a query without any context or follow-up.
    search(query): Promise<Response> {
        return axios
            .post(this.remoteURL, {querytext: query}, {headers: HEADERS})
            .then(extractJsonData)
            .catch(handleHttpError('Error while performing search'));
    }

    // Chat, a sequence of queries with context and follow-up. Only possible if the chat is initialized.
    chat(query, conversationId): Promise<Response> {
        return axios
            .post(this.remoteURL + 'chat', {querytext: query, conversationId}, {headers: HEADERS})
            .then(extractJsonData)
            .catch(handleHttpError('Error while performing search'));
    }

    // Initialize a chat, no query is send, use 'chat' to ask something.
    initializeChat(): Promise<Response> {
        return axios
            .get(this.remoteURL + 'newchat', {headers: HEADERS})
            .then(extractJsonData)
            .catch(handleHttpError('Error while starting chat'));
    }

    deleteChat(conversationId): Promise<Response> {
        return axios
            .post(this.remoteURL + 'deletechat/' + conversationId, {headers: HEADERS})
            .then(extractJsonData)
            .catch(handleHttpError('Error while deleting chat'));
    }

    // Get all conversations for the current user.
    getAllConversations(): Promise<Response> {
        return axios
            .get(this.remoteURL + 'allconversations', {headers: HEADERS})
            .then(extractJsonData)
            .catch(handleHttpError('Error while retrieving all messages'));
    }

    // Get all messages of a past conversation.
    getHistory(conversationId): Promise<Response> {
        return axios
            .get(this.remoteURL + 'history/' + conversationId, {headers: HEADERS})
            .then(extractJsonData)
            .catch(handleHttpError('Error while retrieving chat history'));
    }

    // Get all conversation data of single stored conversation.
    getConversation(conversationId): Promise<Response> {
        return axios
            .get(this.remoteURL + 'conversation/' + conversationId, {headers: HEADERS})
            .then(extractJsonData)
            .catch(handleHttpError('Error while retrieving stored conversation with id ' + conversationId));
    }
}

export default FulltextAPI;
