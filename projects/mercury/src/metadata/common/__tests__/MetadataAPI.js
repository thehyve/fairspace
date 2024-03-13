import mockAxios from 'axios';

import MetadataAPI from '../MetadataAPI';

jest.mock('axios');

beforeEach(() => {
    mockAxios.get.mockResolvedValue({data: [], headers: {'content-type': 'application/json'}});
    mockAxios.patch.mockResolvedValue({data: [], headers: {'content-type': 'application/json'}});
});

describe('MetadataAPI', () => {
    it('fetches metadata with provided parameters', () => {
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: [],
            headers: {'content-type': 'application/json'}
        }));

        MetadataAPI.get({subject: 'a', predicate: 'b', object: 'c', withValueProperties: true});

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        //    expect(mockAxios.get).toHaveBeenCalledWith('/api/metadata/?subject=a&predicate=b&object=c&withValueProperties=true', {headers: {Accept: 'application/ld+json'}});
    });

    it('calls the correct url without any parameters', () => {
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: [],
            headers: {'content-type': 'application/json'}
        }));

        MetadataAPI.get({});

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith('/api/metadata/?', {headers: {Accept: 'application/ld+json'}});
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
                hasEmployees: [
                    {'@value': 'John Snow'},
                    {'@value': 'Ygritte'}
                ]
            },
            {
                '@id': 'http://thehyve.nl',
                hasFriends: [
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
        expect(mockAxios.patch).toHaveBeenCalledWith('/api/metadata/', JSON.stringify(expected), {headers: {'Content-type': 'application/ld+json'}});
    });
});
