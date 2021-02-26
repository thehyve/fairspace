// @flow
import axios from 'axios';
import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";

export type SearchResult = {|
    id: string;
    label: string;
    type: string;
    comment?: string;
|}

export const HEADERS = {'Content-Type': 'application/json', 'Accept': 'application/json'};
const searchUrl = "/api/textsearch/";

/**
 * Search for resources based on name or description, given query as a simple text.
 */
class SearchAPI {
    search(body): Promise<SearchResult[]> {
        return axios.post(searchUrl, body, {headers: HEADERS})
            .catch(handleHttpError("Error while performing search"))
            .then(extractJsonData)
            .then(data => data.results);
    }

    /**
     * Search for resources, matching the specified type.
     * @param query
     * @param type
     * @returns {Q.Promise<SearchResult[]>}
     */
    lookupSearch(query: string, type: string): Promise<SearchResult[]> {
        return this.search(JSON.stringify({query, resourceType: type}));
    }

    /**
     * Search for files, directories and collections within specified directory (parent IRI).
     * @param query
     * @param parentIRI
     * @returns {Q.Promise<SearchResult[]>}
     */
    searchForFiles(query: string, parentIRI: string): Promise<SearchResult[]> {
        return this.search(JSON.stringify({query, parentIRI, resourceType: "fs:File"}));
    }
}

const searchAPI = new SearchAPI();

export default searchAPI;
