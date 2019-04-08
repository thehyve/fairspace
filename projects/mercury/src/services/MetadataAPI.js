import * as jsonld from 'jsonld/dist/jsonld';
import Config from "./Config/Config";
import failOnHttpError from "../utils/httpUtils";
import Vocabulary from "./Vocabulary";

class MetadataAPI {
    static getParams = {
        method: 'GET',
        headers: new Headers({Accept: 'application/ld+json'}),
        credentials: 'same-origin'
    };

    get(params) {
        const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
        return fetch(`${Config.get().urls.metadata.statements}?labels&${query}`, MetadataAPI.getParams)
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
            ? fetch(Config.get().urls.metadata.statements
                + '?subject=' + encodeURIComponent(subject)
                + '&predicate=' + encodeURIComponent(predicate), {method: 'DELETE', credentials: 'same-origin'})
            : fetch(Config.get().urls.metadata.statements, {
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
        // TODO: store the user and system vocabulary separately to allow
        //       easy vocabulary editing for the user vocabulary
        return Config.waitFor()
            .then(() => fetch(Config.get().urls.vocabulary, MetadataAPI.getParams))
            .then(failOnHttpError("Failure when retrieving the vocabulary"))
            .then(response => response.json())
            .then(jsonld.expand)
            .then(expandedVocabulary => new Vocabulary(expandedVocabulary));
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

export default new MetadataAPI();
