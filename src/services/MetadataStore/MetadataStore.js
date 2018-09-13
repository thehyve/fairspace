import Config from "../../components/generic/Config/Config";
import vocabulary from './vocabulary'
import {failOnHttpError} from "../../utils/httputils";
import * as jsonld from 'jsonld/dist/jsonld';



class MetadataStore {
    static getParams = {
        method: 'GET',
        headers: new Headers({'Accept': 'application/ld+json'}),
        credentials: 'same-origin'
    };

    get(params) {
        let query = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
        return fetch(Config.get().urls.metadata + '?' + query, MetadataStore.getParams)
            .then(failOnHttpError("Failure when retrieving metadata"))
            .then(response => response.json())
            .then(jsonld.expand);
    }

    getVocabulary() {
        return jsonld.expand(vocabulary)
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

export default new MetadataStore();
