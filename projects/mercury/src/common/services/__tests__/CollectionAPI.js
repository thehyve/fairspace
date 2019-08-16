import mockAxios from 'axios';

import CollectionAPI from "../CollectionAPI";
import Config from "../Config/Config";

beforeAll(() => {
    Config.setConfig({
        urls: {
            collections: "/collections"
        }
    });

    return Config.init();
});

it('retrieves data for collections', async () => {
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({
        data: [{name: 'collection1'}],
        headers: {'content-type': 'application/json'}
    }));

    const collections = await CollectionAPI.getCollections();

    expect(collections).toEqual([{name: 'collection1'}]);
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith('/collections', {headers: {Accept: 'application/json'}});
});
