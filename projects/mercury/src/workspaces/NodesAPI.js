import axios from 'axios';
import {extractJsonData, handleHttpError} from '../common';


const nodesUrl = "/api/v1/nodes/";

export type Node = {
    id: string;
}

class NodesAPI {
    getNodes(): Promise<Node[]> {
        return axios.get(nodesUrl, {headers: {Accept: 'application/json'}})
            .catch(handleHttpError("Failure when retrieving a list of nodes"))
            .then(extractJsonData)
            .then((ids: string[]) => ids.map((id) => ({id})));
    }
}

export default new NodesAPI();
