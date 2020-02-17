import mockAxios from 'axios';
import crossWorkspacesSearchAPI from '../CrossWorkspacesSearchAPI';

beforeEach(() => {
    mockAxios.get.mockClear();
});

describe('CrossWorkspacesSearchAPI', () => {
    it('Fetches cross workspaces search results', async () => {
        const dummyResults = [{id: 'res1'}, {id: 'res2'}];
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: dummyResults,
            headers: {'content-type': 'application/json'}
        }));
        await crossWorkspacesSearchAPI.search({query: 'test'});
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/search/_all?query=test',
            {headers: {Accept: 'application/json'}});
    });
});
