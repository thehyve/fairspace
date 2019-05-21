import {expand} from 'jsonld';
import Config from "./Config/Config";
import failOnHttpError from "../utils/httpUtils";
import {normalizeTypes, toJsonLd} from "../utils/linkeddata/jsonLdConverter";

class LinkedDataAPI {
    static getParams = {
        method: 'GET',
        headers: new Headers({Accept: 'application/ld+json'}),
        credentials: 'same-origin'
    };

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
        return fetch(`${this.getStatementsUrl()}?labels&${query}`, LinkedDataAPI.getParams)
            .then(failOnHttpError("Failure when retrieving metadata"))
            .then(response => response.json())
            .then(expand)
            .then(normalizeTypes);
    }

    /**
     * Creates a new entity
     * @param subject   Single URI representing the subject to update
     * @param properties An object with each key is the iri of the predicate to update
     * and the value is the array of values
     * Each value is an object on its own with one of the following keys
     *   id: referencing another resource
     *   value: referencing a literal value
     * If both keys are specified, the id is stored and the literal value is ignored
     * @param vocabulary The {vocabularyUtils} object containing the shapes for this metadata entity
     * @returns {*}
     */
    createEntity(subject, type, properties, vocabulary) {
        if (!subject || !properties) {
            return Promise.reject(Error("No subject or properties given"));
        }

        const initialValuesJsonLd = Object.keys(properties).map(p => toJsonLd(subject, p, properties[p], vocabulary));

        return this.patch([...initialValuesJsonLd, {'@id': subject, '@type': type}])
            .then(failOnHttpError("Failure when creating entity"));
    }

    /**
     * Update values for all given properties
     * @param subject   Single URI representing the subject to update
     * @param properties An object with each key is the iri of the predicate to update
     * and the value is the array of values
     * Each value is an object on its own with one of the following keys
     *   id: referencing another resource
     *   value: referencing a literal value
     * If both keys are specified, the id is stored and the literal value is ignored
     * @param vocabulary The {vocabularyUtils} object containing the shapes for this metadata entity
     * @returns {*}
     */
    updateEntity(subject, properties, vocabulary) {
        if (!subject || !properties) {
            return Promise.reject(Error("No subject or properties given"));
        }

        const jsonLd = Object.keys(properties).map(p => toJsonLd(subject, p, properties[p], vocabulary));

        return this.patch(jsonLd)
            .then(failOnHttpError("Failure when updating metadata"));
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

        return fetch(this.getEntitiesUrl() + "?type=" + encodeURIComponent(type), LinkedDataAPI.getParams)
            .then(failOnHttpError("Failure when retrieving entities"))
            .then(response => response.json())
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

        return fetch(this.getEntitiesUrl() + "?catalog", LinkedDataAPI.getParams)
            .then(failOnHttpError("Failure when retrieving entities"))
            .then(response => response.json())
            .then(expand)
            .then(normalizeTypes);
    }

    /**
     * Send a patch request to the backend with the given json-ld
     * @param jsonLd
     * @returns {Promise<Response>}
     */
    patch(jsonLd) {
        return fetch(this.getStatementsUrl(), {
            method: 'PATCH',
            headers: new Headers({'Content-type': 'application/ld+json'}),
            credentials: 'same-origin',
            body: JSON.stringify(jsonLd)
        });
    }
}

export const MetadataAPI = new LinkedDataAPI(config => config.urls.metadata);
export const VocabularyAPI = new LinkedDataAPI(config => config.urls.vocabulary);
export const MetaVocabularyAPI = new LinkedDataAPI(config => config.urls.metaVocabulary);
