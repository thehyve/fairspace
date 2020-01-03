import {expand} from 'jsonld';
import axios from 'axios';
import {extractJsonData, handleHttpError} from '../common';

import {normalizeTypes, toJsonLd} from "../common/utils/linkeddata/jsonLdConverter";

const requestOptions = {
    headers: {Accept: 'application/ld+json'}
};

class LinkedDataAPI {
    /**
     *
     * @param graph Either 'metadata' or 'vocabulary' or 'meta-vocabulary'
     */
    constructor(graph) {
        this.statementsUrl = `${graph}/`;
        this.entitiesUrl = `${graph}/entities/`;
    }

    /**
     * Returns the URL to use for separate statements
     * @returns {string}
     */
    getStatementsUrl() {
        return this.statementsUrl;
    }

    /**
     * Returns the URL to use for retrieving a list of entities
     * @returns {string}
     */
    getEntitiesUrl() {
        return this.entitiesUrl;
    }

    get(params = {}) {
        const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');

        return axios.get(`${this.getStatementsUrl()}?${query}`, requestOptions)
            .catch(handleHttpError("Failure when retrieving metadata"))
            .then(extractJsonData)
            .then(expand)
            .then(normalizeTypes);
    }

    /**
     * Updates or creates a new entity
     * @param subject    Single URI representing the subject to update
     * @param properties An object with each key is the iri of the predicate to update
     * and the value is the array of values
     * Each value is an object on its own with one of the following keys
     *   id: referencing another resource
     *   value: referencing a literal value
     * If both keys are specified, the id is stored and the literal value is ignored
     * @param vocabulary The {vocabularyUtils} object containing the shapes for this metadata entity
     * @param type       Entity type. Can be null for existing entities
     * @returns {*}
     */
    updateEntity(subject, properties, vocabulary, type = null) {
        if (!subject || !properties) {
            return Promise.reject(Error("No subject or properties given"));
        }

        const jsonLd = Object.keys(properties).map(p => toJsonLd(subject, p, properties[p], vocabulary));
        if (type) {
            jsonLd.push({'@id': subject, '@type': type});
        }

        return this.patch(jsonLd)
            .catch(handleHttpError("Failure when updating entity"));
    }

    /**
     * Send a patch request to the backend with the given json-ld
     * @param jsonLd
     * @returns {Promise<Response>}
     */
    patch(jsonLd) {
        return axios.patch(this.getStatementsUrl(), JSON.stringify(jsonLd), {
            headers: {'Content-type': 'application/ld+json'}
        });
    }

    /**
     * Deletes a subject from the metadata store
     * @param subject
     * @returns {Promise<Response>}
     */
    delete(subject) {
        return axios.delete(this.getStatementsUrl() + "?subject=" + encodeURIComponent(subject))
            .catch(handleHttpError("Failure when deleting subject"));
    }

    /**
     * Retrieves a DOT notation of the linked data graph.
     *
     * Please note that the backend currently only supports a graph for the vocabulary
     *
     * @returns {Promise<AxiosResponse<T> | never>}
     */
    graph() {
        const requestDotParams = {
            headers: {Accept: 'text/vnd.graphviz'}
        };

        return axios.get(this.getStatementsUrl(), requestDotParams)
            .then(response => response.data)
            .catch(handleHttpError("Failure when retrieving graph"));
    }
}

export const MetadataAPI = new LinkedDataAPI('metadata');
export const VocabularyAPI = new LinkedDataAPI('vocabulary');
export const MetaVocabularyAPI = new LinkedDataAPI('meta-vocabulary');
