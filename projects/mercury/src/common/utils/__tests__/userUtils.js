import getDisplayName from "../userUtils";

describe('usersUtils', () => {
    const mockUser = {
        iri: "http://example.com#b4804cdb-b690-41ef-a167-6af7ed983d8d",
        name: 'Daenarys Targaryen',
        email: 'user@example.com'
    };

    describe('get full name', () => {
        it('should return full name', () => {
            const res = getDisplayName(mockUser);
            expect(res).toEqual('Daenarys Targaryen');
        });
    });
});
