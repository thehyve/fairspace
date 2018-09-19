import Config from "../../components/generic/Config/Config";
import vocabulary from './vocabulary.json'
import {failOnHttpError} from "../../utils/httputils";
import * as jsonld from 'jsonld/dist/jsonld';
import Vocabulary from "./Vocabulary";

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

    getVocabulary() {
        return this.vocabularyPromise;
    }

    getSubjectsByType(type) {
        return this.get({predicate: 'http://www.w3.org/2000/01/rdf-schema#type', object: type})
            .then(items => items.map(it => it['@id']).sort())
    }

    getPropertiesByDomain(type) {
        return this.getVocabulary()
            .then(subjects => subjects.filter(s =>
                (s['@type'] || []).includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#Property')
                && (s['http://www.w3.org/2000/01/rdf-schema#domain'] || []).includes(type)))
    }
}

export default new MetadataAPI();
