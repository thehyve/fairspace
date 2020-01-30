// @flow
import axios from 'axios';

import {extractJsonData, handleHttpError} from '../common';

const projectsUrl = "/api/v1/projects/";

export type Project = {
    id: string;
    label?: string;
    description?: string;
    workspace: string;
}

class ProjectsAPI {
    createProject(project: Project): Promise<Project> {
        return axios.put(projectsUrl, JSON.stringify(project), {
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        })
            .then(extractJsonData)
            .catch(handleHttpError("Failure while creating a project"));
    }
}

const projectsAPI = new ProjectsAPI();

export default projectsAPI;
