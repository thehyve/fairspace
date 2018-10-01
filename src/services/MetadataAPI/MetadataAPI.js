import Config from "../../components/generic/Config/Config";
import vocabulary from './vocabulary.json'
import {failOnHttpError} from "../../utils/httputils";
import * as jsonld from 'jsonld/dist/jsonld';
import Vocabulary from "./Vocabulary";

export const PROPERTY_URI = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property';
export const CLASS_URI = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Class';
export const LABEL_URI = 'http://www.w3.org/2000/01/rdf-schema#label';
export const DOMAIN_URI = 'http://www.w3.org/2000/01/rdf-schema#domain';
export const RANGE_URI = 'http://www.w3.org/2000/01/rdf-schema#range';
export const TYPE_URI = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

export const STRING_URI = 'http://www.w3.org/TR/xmlschema11-2/#string';
export const BOOLEAN_URI = 'http://www.w3.org/TR/xmlschema11-2/#boolean';
export const DATETIME_URI = 'http://www.w3.org/TR/xmlschema11-2/#dateTime';
export const DATE_URI = 'http://www.w3.org/TR/xmlschema11-2/#date';
export const TIME_URI = 'http://www.w3.org/TR/xmlschema11-2/#time';
export const INTEGER_URI = 'http://www.w3.org/TR/xmlschema11-2/#integer';
export const DECIMAL_URI = 'http://www.w3.org/TR/xmlschema11-2/#decimal';

export const ALLOW_MULTIPLE_URI = 'http://fairspace.io/ontology#allowMultiple';
export const MULTILINE_PROPERTY_URI = 'http://fairspace.io/ontology#multiLine';

class MetadataAPI {

    static getParams = {
        method: 'GET',
        headers: new Headers({'Accept': 'application/ld+json'}),
        credentials: 'same-origin'
    };

    constructor() {
        // Initialize the vocabulary
        this.vocabularyPromise =
            jsonld.expand(vocabulary)
                .then(expandedVocabulary => new Vocabulary(expandedVocabulary))
    }

    get(params) {
        let query = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
        return fetch(Config.get().urls.metadata + '?' + query, MetadataAPI.getParams)
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
        if(!subject || !predicate || !values) {
            return Promise.reject("No subject, predicate or values given");
        }

        return fetch(Config.get().urls.metadata, {
            method: 'PATCH',
            headers: new Headers({'Content-type': 'application/ld+json'}),
            credentials: 'same-origin',
            body: JSON.stringify(this.toJsonLd(subject, predicate, values))
        }).then(failOnHttpError("Failure when updating metadata"));
    }

    getVocabulary() {
        return this.vocabularyPromise;
    }

    getEntitiesByType(type) {
        return this.get({predicate: TYPE_URI, object: type})
    }

    getPropertiesByDomain(type) {
        return this.getVocabulary()
            .then(subjects => subjects.filter(s =>
                (s['@type'] || []).includes(PROPERTY_URI)
                && (s[DOMAIN_URI] || []).includes(type)))
    }

    toJsonLd(subject, predicate, values) {
        return [
            {
                '@id': subject,
                [predicate]: values.map(value => ({'@id': value.id, '@value': value.value}))
            }
        ]
    }
}

export default new MetadataAPI();
