import mockAxios from 'axios';
import WorkspacesAPI, {Workspace} from '../WorkspacesAPI';

describe('WorkspacesAPI', () => {
    it('Fetches workspaces', async () => {
        const dummyWorkspaces = ['workspace1', 'workspace2'];
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: dummyWorkspaces,
            headers: {'content-type': 'application/json'}
        }));
        const projects: Workspace[] = await WorkspacesAPI.getWorkspaces();
        expect(projects.map((workspace: Workspace) => workspace.id)).toEqual(dummyWorkspaces);
    });
});
