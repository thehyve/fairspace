import mockAxios, {AxiosError, AxiosResponse} from 'axios';
import workspacesAPI, {Workspace} from '../WorkspacesAPI';

describe('WorkspacesAPI', () => {
    it('Fetches workspaces', async () => {
        const dummyWorkspaces = [{name: 'workspace1'}, {name: 'workspace2'}];
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: dummyWorkspaces,
            headers: {'content-type': 'application/json'}
        }));
        const workspaces: Workspace[] = await workspacesAPI.getWorkspaces();
        expect(workspaces.map((workspace: Workspace) => workspace.name)).toEqual(dummyWorkspaces.map(workspace => workspace.name));
    });

    it('Creates a new workspace', async () => {
        const workspaceData: Workspace = {
            name: 'workspace1'
        };
        const putResponse: AxiosResponse = {
            headers: {'content-type': 'application/json'}
        };
        mockAxios.put.mockImplementationOnce(() => Promise.resolve(putResponse));
        await workspacesAPI.createWorkspace(workspaceData);
        expect(mockAxios.put).toHaveBeenCalledTimes(1);
        expect(mockAxios.put).toHaveBeenCalledWith(
            '/api/workspaces/',
            "{\"name\":\"workspace1\"}",
            {headers: {Accept: 'application/json'}}
        );
    });

    it('Failure to create a workspace is handled correctly', async (done) => {
        const workspaceData: Workspace = {
            name: 'workspace1'
        };
        const conflictResponse: AxiosResponse = {
            status: 409,
            headers: {'content-type': 'application/json'}
        };
        const errorResponse: AxiosError = {response: conflictResponse};
        mockAxios.put.mockImplementationOnce(() => Promise.reject(errorResponse));
        try {
            await workspacesAPI.createWorkspace(workspaceData);
            done.fail('API call expected to fail');
        } catch (error) {
            expect(error.message).toEqual('Failure while creating a workspace');
            done();
        }
    });

    it('Deletes a new workspace', async () => {
        const workspaceIri: string = 'workspace1';
        const deleteResponse: AxiosResponse = {
            headers: {'content-type': 'application/json'}
        };
        mockAxios.delete.mockImplementationOnce(() => Promise.resolve(deleteResponse));
        await workspacesAPI.deleteWorkspace(workspaceIri);
        expect(mockAxios.delete).toHaveBeenCalledTimes(1);
        expect(mockAxios.delete).toHaveBeenCalledWith(
            '/api/workspaces/?workspace=workspace1',
            {headers: {Accept: 'application/json'}}
        );
    });
});
