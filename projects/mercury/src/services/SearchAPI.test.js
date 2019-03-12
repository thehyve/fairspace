import {SearchAPI} from "./SearchAPI";
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI} from "../constants";

let mockClient;
let searchAPI;

describe('Search API', () => {
    beforeEach(() => {
        mockClient = {
            search: jest.fn()
        };
        searchAPI = new SearchAPI(mockClient);
    });

    it('forwards the query to ES', () => {
        searchAPI.performSearch('my-query');
        expect(mockClient.search.mock.calls.length).toEqual(1);
        expect(mockClient.search.mock.calls[0][0].body.query.bool.must[0].query_string.query).toEqual('my-query');
    });

    it('filters ES results based on types', () => {
        searchAPI.performSearch('my-query');
        expect(mockClient.search.mock.calls.length).toEqual(1);
        expect(mockClient.search.mock.calls[0][0].body.query.bool.filter[0].terms['type.keyword']).toEqual(
            expect.arrayContaining([FILE_URI, COLLECTION_URI, DIRECTORY_URI])
        );
    });
});
