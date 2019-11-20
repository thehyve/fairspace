import mockAxios from 'axios';

import {MetadataAPI} from "../LinkedDataAPI";

beforeEach(() => {
    mockAxios.get.mockClear();
    mockAxios.patch.mockClear();
});

describe('LinkedDataApi', () => {
    it('fetches metadata with provided parameters', () => {
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({data: [], headers: {'content-type': 'application/json'}}));

        MetadataAPI.get({subject: 'a', predicate: 'b', object: 'c', includeObjectProperties: true});

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/metadata/?subject=a&predicate=b&object=c&includeObjectProperties=true', {headers: {Accept: 'application/ld+json'}});
    });

    it('calls the correct url without any parameters', () => {
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({data: [], headers: {'content-type': 'application/json'}}));

        MetadataAPI.get({});

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/metadata/?', {headers: {Accept: 'application/ld+json'}});
    });

    it('stores metadata as jsonld', () => {
        MetadataAPI.updateEntity(
            'http://thehyve.nl',
            {
                hasEmployees: [{value: 'John Snow'}, {value: 'Ygritte'}],
                hasFriends: [{value: 'John Sand'}, {value: 'Ettirgy'}],
            },
            [],
            'http://examle.com/Company'
        );

        const expected = [
            {
                '@id': 'http://thehyve.nl',
                'hasEmployees': [
                    {'@value': 'John Snow'},
                    {'@value': 'Ygritte'}
                ]
            },
            {
                '@id': 'http://thehyve.nl',
                'hasFriends': [
                    {'@value': 'John Sand'},
                    {'@value': 'Ettirgy'}
                ]
            },
            {
                '@id': 'http://thehyve.nl',
                '@type': 'http://examle.com/Company',
            }
        ];

        expect(mockAxios.patch).toHaveBeenCalledTimes(1);
        expect(mockAxios.patch).toHaveBeenCalledWith('/api/v1/metadata/', JSON.stringify(expected), {headers: {'Content-type': 'application/ld+json'}});
    });
});
