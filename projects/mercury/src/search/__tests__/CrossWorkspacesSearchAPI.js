import mockAxios from 'axios';
import crossWorkspacesSearchAPI from '../CrossWorkspacesSearchAPI';

describe('CrossWorkspacesSearchAPI', () => {
    it('Fetches cross workspaces search results', () => {
        const dummyResults = [{id: 'res1'}, {id: 'res2'}];
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: dummyResults,
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
        }));
        crossWorkspacesSearchAPI.search({query: 'test'});
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith('_all/search/query=test',
            {headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}});
    });
});
