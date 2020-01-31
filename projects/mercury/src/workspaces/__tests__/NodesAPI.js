import mockAxios from 'axios';
import NodesAPI, {Node} from '../NodesAPI';

describe('NodesAPI', () => {
    it('Fetches nodes', async () => {
        const dummyNodes = ['node1', 'node2'];
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: dummyNodes,
            headers: {'content-type': 'application/json'}
        }));
        const workspaces: Node[] = await NodesAPI.getNodes();
        expect(workspaces.map((node: Node) => node.id)).toEqual(dummyNodes);
    });
});
