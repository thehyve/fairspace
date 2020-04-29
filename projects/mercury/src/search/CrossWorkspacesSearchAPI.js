import axios from "axios";
import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";

const crossWorkspacesSearchUrl = "/api/v1/search/_all";

class CrossWorkspacesSearchAPI {
    search({query}) {
        const queryString = query ? `?query=${query}` : '';
        return axios.get(`${crossWorkspacesSearchUrl}${queryString}`, {
            headers: {Accept: 'application/json'},
        })
            .then(extractJsonData)
            .catch(handleHttpError("Failure while searching cross workspaces."));
    }
}

const crossWorkspacesSearchAPI = new CrossWorkspacesSearchAPI();

export default crossWorkspacesSearchAPI;
