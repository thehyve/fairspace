import MetadataAPI from "./MetadataAPI";
import Config from "../Config/Config";

const mockResponse = (status, statusText, response) => {
    return new window.Response(response, {
        status: status,
        statusText: statusText,
        headers: {
            'Content-type': 'application/ld+json'
        }
    });
};

beforeAll(() => {
    Config.setConfig({
        "urls": {
            "metadata": {
                statements: "/metadata",
                query: "/query"
            }
        }
    });

    return Config.init();
});

it('fetches metadata with provided parameters', () => {
    window.fetch = jest.fn(() =>
        Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))))
    ;

    MetadataAPI.get({subject: 'a', predicate: 'b', object: 'c'})
    expect(window.fetch.mock.calls[0][0]).toEqual("/metadata?subject=a&predicate=b&object=c");
})

it('stores metadata as jsonld', () => {
    window.fetch = jest.fn(() =>
        Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))))
    ;

    MetadataAPI.update('http://thehyve.nl', 'hasEmployees', [{value: 'John Snow'}, {value: 'Ygritte'}])
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
})

it('retrieves metadata entities using a sparql query', () => {
    window.fetch = jest.fn(() =>
        Promise.resolve(mockResponse(200, 'OK', JSON.stringify([]))))
    ;

    const type = 'http://my-special-entity-type';
    MetadataAPI.getEntitiesByType(type);
    expect(window.fetch.mock.calls[0][0]).toEqual("/query");
    expect(window.fetch.mock.calls[0][1].method).toEqual('POST');
    expect(window.fetch.mock.calls[0][1].body).toContain('PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>');
    expect(window.fetch.mock.calls[0][1].body).toContain(type);
})
