import * as jsonld from 'jsonld/dist/jsonld';
import Config from "./Config/Config";
import failOnHttpError from "../utils/httpUtils";

class MetadataAPI {
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

    getStatementsUrl() {
        return this.configParserFunc(Config.get()).statements;
    }

    getEntitiesUrl() {
        return this.configParserFunc(Config.get()).statements;
    }

    get(params) {
        const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
        return fetch(`${this.getStatementsUrl()}?labels&${query}`, MetadataAPI.getParams)
            .then(failOnHttpError("Failure when retrieving metadata"))
            .then(response => response.json())
            .then(jsonld.expand);
    }

    /**
     * Update values in the metadata store
     * @param subject   Single URI representing the subject to update
     * @param predicate Single URI representing the predicate to update
     * @param values    Array with objects representing the rdf-object for the triples.
     *                  Each object must have a 'value' key.
     *                  e.g.: [ {value: 'user 1'}, {value: 'another user'} ]
     * @returns {*}
     */
    update(subject, predicate, values) {
        if (!subject || !predicate || !values) {
            return Promise.reject(Error("No subject, predicate or values given"));
        }

        const request = (values.length === 0)
            ? fetch(this.getStatementsUrl()
                + '?subject=' + encodeURIComponent(subject)
                + '&predicate=' + encodeURIComponent(predicate), {method: 'DELETE', credentials: 'same-origin'})
            : fetch(this.getStatementsUrl(), {
                method: 'PATCH',
                headers: new Headers({'Content-type': 'application/ld+json'}),
                credentials: 'same-origin',
                body: JSON.stringify(this.toJsonLd(subject, predicate, values))
            });

        return request.then(failOnHttpError("Failure when updating metadata"));
    }

    /**
     * Retrieves the vocabulary (user and system) and instantiates a Vocabulary object with it
     * @returns {Promise<Vocabulary | never>}
     */
    getVocabulary() {
        // TODO: use the new combined endpoint to retrieve both vocabularies at once
        return Config.waitFor()
            .then(() => fetch(Config.get().urls.vocabulary.combined, MetadataAPI.getParams))
            .then(failOnHttpError("Failure when retrieving the combined vocabulary"))
            .then(response => response.json())
            .then(jsonld.expand)
    }

    /**
     * Retrieves the meta vocabulary
     * @returns {Promise<Vocabulary | never>}
     */
    getMetaVocabulary() {
        return fetch(Config.get().urls.vocabulary.meta, MetadataAPI.getParams)
            .then(failOnHttpError("Failure when retrieving the meta vocabulary"))
            .then(response => response.json())
            .then(jsonld.expand);
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
        return fetch(Config.get().urls.metadata.entities + "?type=" + encodeURIComponent(type), MetadataAPI.getParams)
            .then(failOnHttpError("Failure when retrieving entities"))
            .then(response => response.json())
            .then(jsonld.expand);
    }

    /**
     * Returns all Fairspace entities in the metadata store for the given type
     *
     * @returns Promise<jsonld> A promise with an expanded version of the JSON-LD structure, describing the entities.
     *                          The entities will have an ID, type and optionally an rdfs:label
     */
    getAllEntities() {
        return fetch(Config.get().urls.metadata.entities, MetadataAPI.getParams)
            .then(failOnHttpError("Failure when retrieving entities"))
            .then(response => response.json())
            .then(jsonld.expand);
    }

    toJsonLd(subject, predicate, values) {
        return [
            {
                '@id': subject,
                [predicate]: values.map(value => ({'@id': value.id, '@value': value.value}))
            }
        ];
    }
}

export default {
    metadata: new MetadataAPI(config => config.urls.metadata),
    vocabulary: new MetadataAPI(config => config.urls.vocabulary),
    metaVocabulary: new MetadataAPI(config => config.urls.metaVocabulary)
};
