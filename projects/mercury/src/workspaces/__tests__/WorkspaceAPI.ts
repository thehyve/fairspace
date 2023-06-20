// @ts-nocheck
import mockAxios, {AxiosError, AxiosResponse} from "axios";
import workspacesAPI, {Workspace} from "../WorkspacesAPI";
jest.mock('axios');
describe('WorkspacesAPI', () => {
    it('Fetches workspaces', async () => {
        const dummyWorkspaces = [{
            code: 'workspace1'
        }, {
            code: 'workspace2'
        }];
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: dummyWorkspaces,
            headers: {
                'content-type': 'application/json'
            }
        }));
        const workspaces: Workspace[] = await workspacesAPI.getWorkspaces();
        expect(workspaces.map((workspace: Workspace) => workspace.code)).toEqual(dummyWorkspaces.map(workspace => workspace.code));
    });
    it('Creates a new workspace', async () => {
        const workspaceData: Workspace = {
            code: 'workspace1'
        };
        const putResponse: AxiosResponse = {
            headers: {
                'content-type': 'application/json'
            }
        };
        mockAxios.put.mockImplementationOnce(() => Promise.resolve(putResponse));
        await workspacesAPI.createWorkspace(workspaceData);
        expect(mockAxios.put).toHaveBeenCalledTimes(1);
        expect(mockAxios.put).toHaveBeenCalledWith('/api/workspaces/', "{\"code\":\"workspace1\"}", {
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            }
        });
    });
    it('Failure to create a workspace is handled correctly', done => {
        const workspaceData: Workspace = {
            code: 'workspace1'
        };
        const conflictResponse: AxiosResponse = {
            status: 409,
            headers: {
                'content-type': 'application/json'
            }
        };
        const errorResponse: AxiosError = {
            response: conflictResponse
        };
        mockAxios.put.mockImplementationOnce(() => Promise.reject(errorResponse));
        workspacesAPI.createWorkspace(workspaceData).then(() => {
            done.fail('API call expected to fail');
        }).catch(error => {
            expect(error.message).toEqual('Failure while creating a workspace');
            done();
        });
    });
    it('Deletes a new workspace', async () => {
        const workspaceIri = 'workspace1';
        const deleteResponse: AxiosResponse = {
            headers: {
                'content-type': 'application/json'
            }
        };
        mockAxios.delete.mockImplementationOnce(() => Promise.resolve(deleteResponse));
        await workspacesAPI.deleteWorkspace(workspaceIri);
        expect(mockAxios.delete).toHaveBeenCalledTimes(1);
        expect(mockAxios.delete).toHaveBeenCalledWith('/api/workspaces/?workspace=workspace1', {
            headers: {
                Accept: 'application/json'
            }
        });
    });
});