import {expand} from 'jsonld';
import axios from 'axios';
import {extractJsonData, handleHttpError} from '../../common/utils/httpUtils';

import {normalizeTypes} from "./jsonLdConverter";

const requestOptions = {
    headers: {Accept: 'application/ld+json'}
};

class LinkedDataAPI {
    /**
     *
     * @param graph Either 'metadata' or 'vocabulary'
     */
    constructor(graph) {
        this.statementsUrl = `/api/v1/${graph}/`;
    }

    /**
     * Returns the URL to use for separate statements
     * @returns {string}
     */
    getStatementsUrl() {
        return this.statementsUrl;
    }

    get(params = {}) {
        if (Object.prototype.hasOwnProperty.call(params, 'subject') && !params.subject) {
            return Promise.reject(new Error('Please provide a valid subject.'));
        }

        const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');

        return axios.get(`${this.getStatementsUrl()}?${query}`, requestOptions)
            .then(extractJsonData)
            .then(expand)
            .then(normalizeTypes)
            .catch(handleHttpError("Failure when retrieving metadata"));
    }
}

export default LinkedDataAPI;
