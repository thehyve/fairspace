import mockAxios from 'axios';

import {MetadataAPI} from "../LinkedDataAPI";
import Config from "../Config/Config";
import {vocabularyUtils} from "../../utils/linkeddata/vocabularyUtils";

beforeAll(() => {
    Config.setConfig({
        urls: {
            metadata: {
                statements: "/meta/",
                entities: "/entities/",
            }
        }
    });

    return Config.init();
});

beforeEach(() => {
    mockAxios.get.mockClear();
    mockAxios.patch.mockClear();
});

it('fetches metadata with provided parameters', () => {
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({data: []}));

    MetadataAPI.get({subject: 'a', predicate: 'b', object: 'c', includeObjectProperties: true});

    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith('/meta/?subject=a&predicate=b&object=c&includeObjectProperties=true', {headers: {Accept: 'application/ld+json'}});
});

it('calls the correct url without any parameters', () => {
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({data: []}));

    MetadataAPI.get({});

    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith('/meta/?', {headers: {Accept: 'application/ld+json'}});
});

it('stores metadata as jsonld', () => {
    MetadataAPI.updateEntity(
        'http://thehyve.nl',
        {
            hasEmployees: [{value: 'John Snow'}, {value: 'Ygritte'}]
        },
        vocabularyUtils([]),
        'http://examle.com/Company'
    );

    const expected = [{
        '@id': 'http://thehyve.nl',
        'hasEmployees': [
            {'@value': 'John Snow'},
            {'@value': 'Ygritte'}
        ]
    },
    {
        '@id': 'http://thehyve.nl',
        '@type': 'http://examle.com/Company',
    }];

    expect(mockAxios.patch).toHaveBeenCalledTimes(1);
    expect(mockAxios.patch).toHaveBeenCalledWith('/meta/', JSON.stringify(expected), {headers: {'Content-type': 'application/ld+json'}});
});

it('stores metadata as jsonld (Full entity)', () => {
    MetadataAPI.updateEntity(
        'http://thehyve.nl',
        {
            hasEmployees: [{value: 'John Snow'}, {value: 'Ygritte'}],
            hasFriends: [{value: 'John Sand'}, {value: 'Ettirgy'}],
        },
        vocabularyUtils([]),
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
    expect(mockAxios.patch).toHaveBeenCalledWith('/meta/', JSON.stringify(expected), {headers: {'Content-type': 'application/ld+json'}});
});

it('retrieves metadata entities using a sparql query', () => {
    mockAxios.get.mockImplementationOnce(() => Promise.resolve({data: []}));

    const type = 'http://my-special-entity-type';
    MetadataAPI.getEntitiesByType(type);

    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith('/entities/?type=http%3A%2F%2Fmy-special-entity-type', {headers: {Accept: 'application/ld+json'}});
});
