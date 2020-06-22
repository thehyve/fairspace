import mockAxios from 'axios';

import CollectionAPI from "../CollectionAPI";

beforeEach(() => {
    mockAxios.get.mockClear();
    mockAxios.patch.mockClear();
});

describe('CollectionAPI', () => {
    it('retrieves data for collections', async () => {
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: [{name: 'collection1'}],
            headers: {'content-type': 'application/json'}
        }));

        const collections = await CollectionAPI.getCollections();

        expect(collections).toEqual([{name: 'collection1'}]);
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/collections/', {headers: {Accept: 'application/json'}});
    });

    it('retrieves data for collections including deleted', async () => {
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: [{name: 'collection1'}],
            headers: {'content-type': 'application/json'}
        }));

        const collectionsWithDeleted = await CollectionAPI.getCollections(true);

        expect(collectionsWithDeleted).toEqual([{name: 'collection1'}]);
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith(
            '/api/v1/collections/',
            {headers: {'Accept': 'application/json', 'Show-Deleted': 'on'}}
        );
    });

    it('makes a proper call to add a collection', async () => {
        await CollectionAPI.addCollection({
            name: 'name',
            description: 'description',
            location: 'location'
        });

        expect(mockAxios.put).toHaveBeenCalledTimes(1);
        expect(mockAxios.put).toHaveBeenCalledWith(
            '/api/v1/collections/',
            JSON.stringify({
                name: 'name',
                description: 'description',
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
            location: 'location'
        });

        expect(mockAxios.patch).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).toHaveBeenCalledWith(
            '/api/v1/collections/',
            JSON.stringify({
                iri: 'iri',
                name: 'name',
                description: 'description',
                location: 'location'
            }),
            {headers: {'Content-Type': 'application/json'}}
        );
    });

    it('makes a proper call to undelete a collection', async () => {
        await CollectionAPI.undeleteCollection({
            iri: 'id'
        });

        expect(mockAxios.patch).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).toHaveBeenCalledWith(
            '/api/v1/collections/',
            JSON.stringify({
                iri: 'id',
                dateDeleted: null
            }),
            {headers: {'Content-Type': 'application/json', "Show-Deleted": "on"}}
        );
    });

    it('makes a proper call to delete a collection', async () => {
        await CollectionAPI.deleteCollection({
            iri: 'id'
        });

        expect(mockAxios.delete).toHaveBeenCalledTimes(1);
        expect(mockAxios.delete).toHaveBeenCalledWith(
            `/api/v1/collections/?iri=${encodeURIComponent('id')}`,
            {headers: {'Content-Type': 'application/json'}}
        );
    });
});
