import {expand} from 'jsonld';
import Config from "./Config/Config";
import failOnHttpError from "../utils/httpUtils";
import {toJsonLd} from "../utils/metadataUtils";
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
            .then(expand);
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
                body: JSON.stringify(toJsonLd(subject, predicate, values))
            });

        return request.then(failOnHttpError("Failure when updating metadata"));
    }

    /**
     * Update values for all given properties
     * @param subject   Single URI representing the subject to update
     * @param properties An object with each key is the iri of the predicate to update
     * and the value is the array of values
     * @returns {*}
     */
    updateEntity(subject, properties) {
        if (!subject || !properties) {
            return Promise.reject(Error("No subject or properties given"));
        }

        const jsonLd = Object.keys(properties).map(p => toJsonLd(subject, p, properties[p]));

        return fetch(Config.get().urls.metadata.statements, {
            method: 'PATCH',
            headers: new Headers({'Content-type': 'application/ld+json'}),
            credentials: 'same-origin',
            body: JSON.stringify(jsonLd)
        }).then(failOnHttpError("Failure when updating metadata"));
    }

    /**
     * Retrieves the vocabulary (user and system) and instantiates a Vocabulary object with it
     * @returns {Promise<Vocabulary | never>}
     */
    getVocabulary() {
        // TODO: store the user and system vocabulary separately to allow
        //       easy vocabulary editing for the user vocabulary
        return Config.waitFor()
            .then(() => Promise.all([
                fetch(Config.get().urls.vocabulary.user, MetadataAPI.getParams)
                    .then(failOnHttpError("Failure when retrieving the user vocabulary"))
                    .then(response => response.json())
                    .then(expand),
                fetch(Config.get().urls.vocabulary.system, MetadataAPI.getParams)
                    .then(failOnHttpError("Failure when retrieving the system vocabulary"))
                    .then(response => response.json())
                    .then(expand)
            ]))
            .then(([userVocabulary, systemVocabulary]) => [...userVocabulary, ...systemVocabulary])
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
            .then(expand);
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
            .then(expand);
    }
}

export default new MetadataAPI();
