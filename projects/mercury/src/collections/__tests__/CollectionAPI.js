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
        expect(mockAxios.get).toHaveBeenCalledWith('collections/', {headers: {Accept: 'application/json'}});
    });

    it('makes a proper call to add a collection', async () => {
        await CollectionAPI.addCollection({
            name: 'name',
            description: 'description',
            connectionString: 'connectionString',
            location: 'location'
        });

        expect(mockAxios.put).toHaveBeenCalledTimes(1);
        expect(mockAxios.put).toHaveBeenCalledWith(
            'collections/',
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
        await CollectionAPI.updateCollection({
            iri: 'iri',
            name: 'name',
            description: 'description',
            connectionString: 'connectionString',
            location: 'location'
        });

        expect(mockAxios.patch).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).toHaveBeenCalledWith(
            'collections/',
            JSON.stringify({
                iri: 'iri',
                name: 'name',
                description: 'description',
                connectionString: 'connectionString',
                location: 'location'
            }),
            {headers: {'Content-Type': 'application/json'}}
        );
    });

    it('makes a proper call to delete a collection', async () => {
        await CollectionAPI.deleteCollection({
            iri: 'id'
        });

        expect(mockAxios.delete).toHaveBeenCalledTimes(1);
        expect(mockAxios.delete).toHaveBeenCalledWith(
            `collections/?iri=${encodeURIComponent('id')}`,
            {headers: {'Content-Type': 'application/json'}}
        );
    });
});
