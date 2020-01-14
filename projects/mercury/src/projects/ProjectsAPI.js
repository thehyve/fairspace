// @flow
import axios from 'axios';
import {extractJsonData, handleHttpError} from '../common';


const projectsUrl = "/api/v1/projects/";

export type Project = {
    id: string;
    description?: string;
    workspace: string;
}

class ProjectsAPI {
    getProjects(): Promise<Project[]> {
        return axios.get(projectsUrl, {headers: {Accept: 'application/json'}})
            .catch(handleHttpError("Failure when retrieving a list of projects"))
            .then(extractJsonData)
            .then((ids: string[]) => ids.map((id) => ({id, name: id, description: id})));
    }

    createProject(project: Project): Promise<Project> {
        return axios.put(
            projectsUrl,
            JSON.stringify(project),
            {headers: {'Content-Type': 'application/json'}}
        )
        .catch(handleHttpError("Failure while creating a project"))
        .then(extractJsonData);
    }
}

const projectsAPI = new ProjectsAPI();

export default projectsAPI;
