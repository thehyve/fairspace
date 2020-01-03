import mockAxios from 'axios';

import PermissionAPI from "../PermissionAPI";

beforeEach(() => {
    mockAxios.get.mockClear();
    mockAxios.put.mockClear();
});

describe('PermissionAPI', () => {
    it('fetches permissions with proper URL and headers', () => {
        PermissionAPI.getPermissions('resource-iri');

        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith('/permissions/?all=true&iri=resource-iri',
            {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
    });

    it('calls permissions modification with proper URL, payload and headers', () => {
        PermissionAPI.alterPermission('userIri', 'resource-iri', 'access');

        expect(mockAxios.put).toHaveBeenCalledTimes(1);
        expect(mockAxios.put).toHaveBeenCalledWith('/permissions/?iri=resource-iri',
            JSON.stringify({user: "userIri", access: "access"}),
            {headers: {'Content-Type': 'application/json'}});
    });
});
