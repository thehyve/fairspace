import mockAxios, {AxiosError, AxiosResponse} from 'axios';
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
        const putResponse: AxiosResponse = {
            headers: {'content-type': 'application/json'}
        };
        mockAxios.put.mockImplementationOnce(() => Promise.resolve(putResponse));
        await projectsAPI.createProject(projectData);
        expect(mockAxios.put).toHaveBeenCalledTimes(1);
        expect(mockAxios.put).toHaveBeenCalledWith(
            '/api/v1/projects/',
            JSON.stringify(projectData),
            {headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}}
        );
    });

    it('Failure to create a project is handled correctly', async (done) => {
        const projectData: Project = {
            id: 'project1'
        };
        const conflictResponse: AxiosResponse = {
            status: 409,
            headers: {'content-type': 'application/json'}
        };
        const errorResponse: AxiosError = {response: conflictResponse};
        mockAxios.put.mockImplementationOnce(() => Promise.reject(errorResponse));
        try {
            await projectsAPI.createProject(projectData);
            done.fail('API call expected to fail');
        } catch (error) {
            expect(error.message).toEqual('Failure while creating a project');
            done();
        }
    });
});
