// @flow
import mockAxios, {AxiosResponse} from 'axios';
import projectsAPI, {Project} from '../ProjectsAPI';

describe('ProjectsAPI', () => {
    it('Fetches projects', async () => {
        const dummyProjects = [{id: 'project1'}, {id: 'project2'}];
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: dummyProjects,
            headers: {'content-type': 'application/json'}
        }));
        const projects: Project[] = await projectsAPI.getProjects();
        expect(projects.map((project: Project) => project.id)).toEqual(dummyProjects.map(project => project.id));
    });

    it('Creates a new project', async () => {
        const projectData: Project = {
            id: 'project1'
        };
        const createProjectResponse = {
            '@id': 'fs:theProject',
            '@type': 'fs:Project',
            "projectDescription": '',
            "label": 'project1',
            '@context': {
                label: {
                    '@id': 'http://www.w3.org/2000/01/rdf-schema#label'
                },
                projectDescription: {
                    '@id': 'http://fairspace.io/ontology#projectDescription',
                    '@type': 'http://fairspace.io/ontology#markdown'
                },
                vocabulary: 'http://localhost/vocabulary/',
                sh: 'http://www.w3.org/ns/shacl#',
                ws: 'http://localhost/iri/',
                fs: 'http://fairspace.io/ontology#'
            }
        };
        const putResponse: AxiosResponse = {
            data: createProjectResponse,
            headers: {'content-type': 'application/json'}
        };
        mockAxios.put.mockImplementationOnce(() => Promise.resolve(putResponse));
        const response: any = await projectsAPI.createProject(projectData);
        expect(response).toEqual(createProjectResponse);
        expect(mockAxios.put).toHaveBeenCalledTimes(1);
        expect(mockAxios.put).toHaveBeenCalledWith(
            '/api/v1/projects/',
            JSON.stringify(projectData),
            {headers: {'Content-Type': 'application/json'}}
        );
    });

    it('Failure to create a project is handled correctly', async () => {
        const projectData: Project = {
            id: 'project1'
        };
        const conflictResponse: AxiosResponse = {
            status: 409,
            headers: {'content-type': 'application/json'}
        };
        mockAxios.put.mockImplementationOnce(() => Promise.reject({response: conflictResponse}));
        try {
            await projectsAPI.createProject(projectData);
            fail();
        } catch (error) {
            expect(error.message).toEqual('Failure while creating a project');
        }
    });
});
