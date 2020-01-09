// @flow
import axios from 'axios';
import {extractJsonData, handleHttpError} from '../common';


const projectsUrl = "/api/v1/projects/";
const headers = {'Content-Type': 'application/json'};

export type Project = {
    id: string;
    description?: string;
    workspace: string;
}

class projectsAPI {
    getProjects(): Promise<Project[]> {
        return axios.get(projectsUrl, {headers: {Accept: 'application/json'}})
            .catch(handleHttpError("Failure when retrieving a list of projects"))
            .then(extractJsonData)
            .then((ids: string[]) => ids.map((id) => ({id, name: id, description: id})));
    }

    createProject(project: Project) {
        return axios.put(
            projectsUrl,
            JSON.stringify(project),
            {headers}
        ).catch(handleHttpError("Failure while saving a collection"));
    }
}

export default new projectsAPI();
