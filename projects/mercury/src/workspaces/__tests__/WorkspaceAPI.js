import mockAxios, {AxiosError, AxiosResponse} from 'axios';
import workspacesAPI, {Workspace} from '../WorkspacesAPI';

describe('WorkspacesAPI', () => {
    it('Fetches workspaces', async () => {
        const dummyWorkspaces = [{id: 'workspace1'}, {id: 'workspace2'}];
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: dummyWorkspaces,
            headers: {'content-type': 'application/json'}
        }));
        const workspaces: Workspace[] = await workspacesAPI.getWorkspaces();
        expect(workspaces.map((workspace: Workspace) => workspace.id)).toEqual(dummyWorkspaces.map(workspace => workspace.id));
    });

    it('Creates a new workspace', async () => {
        const workspaceData: Workspace = {
            id: 'workspace1'
        };
        const putResponse: AxiosResponse = {
            headers: {'content-type': 'application/json'}
        };
        mockAxios.put.mockImplementationOnce(() => Promise.resolve(putResponse));
        await workspacesAPI.createWorkspace(workspaceData);
        expect(mockAxios.put).toHaveBeenCalledTimes(1);
        expect(mockAxios.put).toHaveBeenCalledWith(
            '/api/v1/workspaces/workspace1',
            '',
            {headers: {Accept: 'application/json'}}
        );
    });

    it('Failure to create a workspace is handled correctly', async (done) => {
        const workspaceData: Workspace = {
            id: 'workspace1'
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

    it('Updates a workspace status', async () => {
        const workspaceData: Workspace = {
            id: 'workspace1',
            name: 'w1',
            description: 'Description of workspace1',
            status: 'Active'
        };
        const patchResponse: AxiosResponse = {
            headers: {'content-type': 'application/json'}
        };
        mockAxios.patch.mockImplementationOnce(() => Promise.resolve(patchResponse));
        await workspacesAPI.updateWorkspaceStatus(workspaceData);
        expect(mockAxios.patch).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).toHaveBeenCalledWith(
            '/api/v1/workspaces/workspace1/status',
            JSON.stringify({
                id: 'workspace1',
                name: 'w1',
                description: 'Description of workspace1',
                status: 'Active'
            }),
            {headers: {Accept: 'application/json'}}
        );
    });
});
