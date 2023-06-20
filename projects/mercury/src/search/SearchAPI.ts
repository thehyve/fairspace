// @ts-nocheck
import axios from "axios";
import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";
import {joinPathsAvoidEmpty} from "../file/fileUtils";
export type SearchResult = {
  id: string;
  label: string;
  type: string;
  comment?: string;
};
export const HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
/**
 * Search for resources based on name or description, given query as a simple text.
 */

class SearchAPI {
    constructor(remoteURL = '/api/search/') {
        this.remoteURL = remoteURL;
    }

    search(path: string, body): Promise<SearchResult[]> {
        return axios.post(joinPathsAvoidEmpty(this.remoteURL, path), body, {
            headers: HEADERS
        }).catch(handleHttpError("Error while performing search")).then(extractJsonData).then(data => data.results);
    }

    /**
   * Search for resources, matching the specified type.
   * @param query
   * @param type
   * @returns {Q.Promise<SearchResult[]>}
   */
    lookupSearch(query: string, type: string): Promise<SearchResult[]> {
        return this.search("lookup", JSON.stringify({
            query,
            resourceType: type
        }));
    }

    /**
   * Search for files, directories and collections within specified directory (parent IRI).
   * @param query
   * @param parentIRI
   * @returns {Q.Promise<SearchResult[]>}
   */
    searchForFiles(query: string, parentIRI: string): Promise<SearchResult[]> {
        return this.search("files", JSON.stringify({
            query,
            parentIRI
        }));
    }

}

export const LocalSearchAPI = new SearchAPI();
export default SearchAPI;