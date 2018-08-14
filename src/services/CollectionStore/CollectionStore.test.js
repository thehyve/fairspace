import CollectionStore from "./CollectionStore";
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
        "urls": {
            "collections": "/collections"
        }
    });

    return Config.init();
});

it('retrieves data for collections', () => {
    window.fetch = jest.fn(() =>
        Promise.resolve(mockResponse(200, 'OK', JSON.stringify([{'name': 'collection1'}]))))
    ;

    CollectionStore.getCollections()
    expect(window.fetch.mock.calls[0][0]).toEqual("/collections");
});
