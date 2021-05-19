import {expand} from 'jsonld';
import axios from 'axios';
import {extractJsonData, handleHttpError} from '../../common/utils/httpUtils';

import {normalizeTypes} from "./jsonLdConverter";
import {flattenShallow} from "../../common/utils/genericUtils";

const requestOptions = {
    headers: {Accept: 'application/ld+json'}
};

class LinkedDataAPI {
    /**
     *
     * @param graph Either 'metadata' or 'vocabulary'
     */
    constructor(graph) {
        this.statementsUrl = `/api/${graph}/`;
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

    getForAllSubjects(subjects: string[]) {
        // eslint-disable-next-line array-callback-return
        const requests = subjects.map(subject => (
            axios.get(`${this.getStatementsUrl()}?subject=${encodeURIComponent(subject)}`, requestOptions)
                .catch(() => null)
        ));
        return axios.all(requests)
            .then(responses => responses.map(extractJsonData))
            .then(responses => Promise.all(responses.map(expand)))
            .then(flattenShallow)
            .then(normalizeTypes)
            .catch(() => null);
    }
}

export default LinkedDataAPI;
