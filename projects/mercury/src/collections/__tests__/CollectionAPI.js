import mockAxios from 'axios';

import CollectionAPI from "../CollectionAPI";

describe('CollectionAPI', () => {
    it('retrieves data for collections', async () => {
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: [{name: 'collection1'}],
            headers: {'content-type': 'application/json'}
        }));

        const collections = await CollectionAPI.getCollections();

        expect(collections).toEqual([{name: 'collection1'}]);
        expect(mockAxios.get).toHaveBeenCalledTimes(2);
        expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/collections/', {headers: {Accept: 'application/json'}});
    });

    it('makes a proper call to add a collection', async () => {
        await CollectionAPI.addCollection('name', 'description', 'connectionString', 'location');

        expect(mockAxios.put).toHaveBeenCalledTimes(1);
        expect(mockAxios.put).toHaveBeenCalledWith(
            '/api/v1/collections/',
            JSON.stringify({
                name: 'name',
                description: 'description',
                connectionString: 'connectionString',
                location: 'location'
            }),
            {headers: {'Content-Type': 'application/json'}}
        );
    });

    it('makes a proper call to update a collection', async () => {
        await CollectionAPI.updateCollection('iri', 'name', 'description', 'connectionString', 'location');

        expect(mockAxios.patch).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).toHaveBeenCalledWith(
            '/api/v1/collections/',
            JSON.stringify({
                iri: 'iri',
                name: 'name',
                description: 'description',
                location: 'location',
                connectionString: 'connectionString'
            }),
            {headers: {'Content-Type': 'application/json'}}
        );
    });

    it('makes a proper call to delete a collection', async () => {
        await CollectionAPI.deleteCollection('id');

        expect(mockAxios.delete).toHaveBeenCalledTimes(1);
        expect(mockAxios.delete).toHaveBeenCalledWith(
            `/api/v1/collections/?iri=${encodeURIComponent('id')}`,
            {headers: {'Content-Type': 'application/json'}}
        );
    });
});
