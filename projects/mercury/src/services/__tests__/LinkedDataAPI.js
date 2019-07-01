import {MetadataAPI} from "../LinkedDataAPI";
import Config from "../Config/Config";
import {vocabularyUtils} from "../../utils/linkeddata/vocabularyUtils";

const mockResponse = (status, statusText, response) => new window.Response(response, {
    status,
    statusText,
    headers: {
        'Content-type': 'application/ld+json'
    }
});

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

it('fetches metadata with provided parameters', () => {
    window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))));
    MetadataAPI.get({subject: 'a', predicate: 'b', object: 'c'});
    expect(window.fetch.mock.calls[0][0]).toEqual("/meta/?subject=a&predicate=b&object=c&includeObjectProperties");
});

it('calls the correct url without any parameters', () => {
    window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))));
    MetadataAPI.get({});
    expect(window.fetch.mock.calls[0][0]).toEqual("/meta/?");
});

it('stores metadata as jsonld', () => {
    window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))));
    MetadataAPI.updateEntity(
        'http://thehyve.nl',
        {
            hasEmployees: [{value: 'John Snow'}, {value: 'Ygritte'}]
        },
        vocabularyUtils([])
    );
    expect(window.fetch.mock.calls[0][1].method).toEqual("PATCH");
    const expected = [{
        '@id': 'http://thehyve.nl',
        'hasEmployees': [
            {'@value': 'John Snow'},
            {'@value': 'Ygritte'}
        ]
    }];
    expect(window.fetch.mock.calls[0][1].body).toEqual(JSON.stringify(expected));
});

it('stores metadata as jsonld (Full entity)', () => {
    window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))));
    MetadataAPI.updateEntity(
        'http://thehyve.nl',
        {
            hasEmployees: [{value: 'John Snow'}, {value: 'Ygritte'}],
            hasFriends: [{value: 'John Sand'}, {value: 'Ettirgy'}],
        },
        vocabularyUtils([])
    );
    expect(window.fetch.mock.calls[0][1].method).toEqual("PATCH");
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
        }
    ];
    expect(window.fetch.mock.calls[0][1].body).toEqual(JSON.stringify(expected));
});

it('retrieves metadata entities using a sparql query', () => {
    window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))));
    const type = 'http://my-special-entity-type';
    MetadataAPI.getEntitiesByType(type);
    expect(window.fetch.mock.calls[0][0]).toEqual("/entities/?type=http%3A%2F%2Fmy-special-entity-type");
    expect(window.fetch.mock.calls[0][1].method).toEqual('GET');
});
