import MetadataStore from "./MetadataStore";
import Config from "../../components/generic/Config/Config";

const mockResponse = (status, statusText, response) => {
    return new window.Response(response, {
        status: status,
        statusText: statusText,
        headers: {
            'Content-type': 'application/json'
        }
    });
};

beforeAll(() => {
    Config.setConfig({
        "metadata": {
            "urlPatterns": {
                "collections": "/metadata/{id}"
            }
        },
        "externalConfigurationFiles": []
    });

    return Config.init().then(() => {MetadataStore.init() });
});

it('sends a uri when adding collection metadata', () => {
    window.fetch = jest.fn(() =>
        Promise.resolve(mockResponse(200, 'OK')))
    ;

    MetadataStore.addCollectionMetadata({id: "collection-id"});
    expect(window.fetch.mock.calls[0][1].body).toEqual(expect.stringContaining('\"uri\":'));
    expect(window.fetch.mock.calls[0][1].body).toEqual(expect.stringContaining('\"/metadata/collection-id\"'));
});

it('fails storing a collection without id', () => {
    MetadataStore.addCollectionMetadata({})
        .then(() => fail())
        .catch(() => {});
});

it('returns metadata only for the selected collections', () => {
    window.fetch = jest.fn(() =>
        Promise.resolve(mockResponse(200, 'OK', JSON.stringify([
            {'uri': '/metadata/1', 'name': 'name1', 'description': 'description1'},
            {'uri': '/metadata/2', 'name': 'name2', 'description': 'description2'},
            {'uri': '/other-object/3', 'name': 'name2', 'description': 'description2'}
        ])))
    );

    // Server returns metadata 1 and 2 and other-object-3
    // We ask for metadata 1 and 3
    // As it should return the union, it will only return metadata 1
    MetadataStore.getCollectionMetadata(['1', '3'])
        .then((collections) => {
            expect(collections.length).toEqual(1);
            expect(collections[0].id).toEqual('1');
            expect(collections[0].name).toEqual('name1');
        }).catch((e) => { fail(e) });
});