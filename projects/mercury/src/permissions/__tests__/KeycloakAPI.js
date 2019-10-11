import mockAxios from 'axios';

import KeycloakAPI from "../KeycloakAPI";

beforeEach(() => {
    mockAxios.get.mockClear();
});

describe('KeycloakAPI', () => {
    it('calls the API with proper URL', () => {
        KeycloakAPI.searchUsers({query: 'query', size: 10});

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith('/api/keycloak/users?search=query&max=10');
    });

    it('extends the returned data with additional "iri" proprety duplicating the user id', async () => {
        mockAxios.get.mockImplementationOnce(() => Promise.resolve({
            data: [
                {
                    id: "13300b41-b4a0-463f-95aa-764d9efdc5cc",
                    firstName: "Ygritte",
                    lastName: "Lopez",
                    enabled: true
                }
            ],
            headers: {'content-type': 'application/json'}
        }));

        const users = await KeycloakAPI.searchUsers({query: 'query', size: 10});

        expect(users).toEqual([
            {
                id: "13300b41-b4a0-463f-95aa-764d9efdc5cc",
                iri: "http://localhost/iri/13300b41-b4a0-463f-95aa-764d9efdc5cc",
                firstName: "Ygritte",
                lastName: "Lopez",
                enabled: true
            }
        ]);
    });
});
