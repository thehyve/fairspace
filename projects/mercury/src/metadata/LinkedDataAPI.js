import {expand} from 'jsonld';
import axios from 'axios';

import Config from "../common/services/Config/Config";
import {handleHttpError, extractJsonData} from "../common/utils/httpUtils";
import {normalizeTypes, toJsonLd} from "../common/utils/linkeddata/jsonLdConverter";

const requestOptions = {
    headers: {Accept: 'application/ld+json'}
};

class LinkedDataAPI {
    /**
     *
     * @param configParserFunc Function to retrieve the right urls from configuration.
     *                         The configuration is not available when constructing the object, so
     *                         we provide this function to be able to extract the right information
     *
     *                         Function input: config
     *                         Function output: {statements: ..., entities: ...}
     */
    constructor(configParserFunc) {
        this.configParserFunc = configParserFunc;
    }

    /**
     * Returns the URL to use for separate statements
     * @returns {string}
     */
    getStatementsUrl() {
        return this.configParserFunc(Config.get()).statements;
    }

    /**
     * Returns the URL to use for retrieving a list of entities
     * @returns {string}
     */
    getEntitiesUrl() {
        return this.configParserFunc(Config.get()).entities;
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
     * Returns all entities in the metadata store for the given type
     *
     * More specifically this method returns all entities x for which a
     * triple exist <x> <@type> <type> exists.
     *
     * @param type  URI of the Class that the entities should be a type of
     * @returns Promise<jsonld> A promise with an expanded version of the JSON-LD structure, describing the entities.
     *                          The entities will have an ID, type and optionally an rdfs:label
     */
    getEntitiesByType(type) {
        if (!this.getEntitiesUrl()) {
            return Promise.reject(new Error("No entities URL provided"));
        }

        return axios.get(this.getEntitiesUrl() + "?type=" + encodeURIComponent(type), requestOptions)
            .catch(handleHttpError("Failure when retrieving entities"))
            .then(extractJsonData)
            .then(expand)
            .then(normalizeTypes);
    }

    /**
     * Returns all Fairspace entities in the metadata store for the given type
     *
     * @returns Promise<jsonld> A promise with an expanded version of the JSON-LD structure, describing the entities.
     *                          The entities will have an ID, type and optionally an rdfs:label
     */
    getAllCatalogEntities() {
        if (!this.getEntitiesUrl()) {
            return Promise.reject(new Error("No entities URL provided"));
        }

        return axios.get(this.getEntitiesUrl() + "?catalog", requestOptions)
            .catch(handleHttpError("Failure when retrieving entities"))
            .then(extractJsonData)
            .then(expand)
            .then(normalizeTypes);
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
}

export const MetadataAPI = new LinkedDataAPI(config => config.urls.metadata);
export const VocabularyAPI = new LinkedDataAPI(config => config.urls.vocabulary);
export const MetaVocabularyAPI = new LinkedDataAPI(config => config.urls.metaVocabulary);
