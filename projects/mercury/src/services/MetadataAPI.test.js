import MetadataAPI from "./MetadataAPI";
import Config from "./Config/Config";

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
                pid: "/pid",
                entities: "/entities/",
            }
        }
    });

    return Config.init();
});

it('fetches metadata with provided parameters', () => {
    window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))));
    MetadataAPI.get({subject: 'a', predicate: 'b', object: 'c'});
    expect(window.fetch.mock.calls[0][0]).toEqual("/meta/?labels&subject=a&predicate=b&object=c");
});

it('stores metadata as jsonld', () => {
    window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))));
    MetadataAPI.update('http://thehyve.nl', 'hasEmployees', [{value: 'John Snow'}, {value: 'Ygritte'}]);
    expect(window.fetch.mock.calls[0][1].method).toEqual("PATCH");
    expect(window.fetch.mock.calls[0][1].body).toEqual(JSON.stringify([
        {
            '@id': 'http://thehyve.nl',
            'hasEmployees': [
                {'@value': 'John Snow'},
                {'@value': 'Ygritte'}
            ]
        }
    ]));
});

it('retrieves metadata entities using a sparql query', () => {
    window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))));
    const type = 'http://my-special-entity-type';
    MetadataAPI.getEntitiesByType(type);
    expect(window.fetch.mock.calls[0][0]).toEqual("/entities/?type=http%3A%2F%2Fmy-special-entity-type");
    expect(window.fetch.mock.calls[0][1].method).toEqual('GET');
});


it('fetches pid with provided parameters', () => {
    window.fetch = jest.fn(() => Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))));
    MetadataAPI.getSubjectByPath('/aaa/bbb/ccc');

    expect(window.fetch.mock.calls[0][0]).toEqual(`/pid?path=${encodeURIComponent('/aaa/bbb/ccc')}`);
    expect(window.fetch.mock.calls[0][1].method).toEqual('GET');
    expect(window.fetch.mock.calls[0][1].headers.map['accept']).toEqual('text/plain');
});
