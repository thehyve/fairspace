import reducer from "./permissionsByCollection";

describe('updating permissions', () => {
    it('should add collaborators', () => {
        const previousState = {
            500: {
                data: [
                    {subject: 'user-1', access: 'Manage', collectionId: 500}
                ]
            },
            501: {
                data: []
            }
        };

        const action = {
            type: 'ALTER_PERMISSION_FULFILLED',
            meta: {
                subject: 'my-subject',
                access: 'Read',
                collectionId: 500
            }
        };

        const newState = reducer(previousState, action);

        expect(newState[500].data.length).toEqual(2);
        expect(newState[500].data).toContainEqual({subject: 'my-subject', access: 'Read', collectionId: 500});
        expect(newState[500].data).toContainEqual({subject: 'user-1', access: 'Manage', collectionId: 500});
        expect(newState[500].invalidated).toBe(true);
        expect(newState[501].data.length).toEqual(0);
    });

    it('should update existing collaborators', () => {
        const previousState = {
            500: {
                data: [
                    {subject: 'my-subject', access: 'Manage', collectionId: 500}
                ]
            },
            501: {
                data: []
            }
        };

        const action = {
            type: 'ALTER_PERMISSION_FULFILLED',
            meta: {
                subject: 'my-subject',
                access: 'Read',
                collectionId: 500
            }
        };

        const newState = reducer(previousState, action);

        expect(newState[500].data.length).toEqual(1);
        expect(newState[500].data).toContainEqual({subject: 'my-subject', access: 'Read', collectionId: 500});
        expect(newState[500].invalidated).toBe(true);
        expect(newState[501].data.length).toEqual(0);
    });

    it('should delete existing collaborators', () => {
        const previousState = {
            500: {
                data: [
                    {subject: 'my-subject', access: 'Manage', collectionId: 500},
                    {subject: 'other-subject', access: 'Write', collectionId: 500}
                ]
            },
            501: {
                data: []
            }
        };

        const action = {
            type: 'ALTER_PERMISSION_FULFILLED',
            meta: {
                subject: 'my-subject',
                access: 'None',
                collectionId: 500
            }
        };

        const newState = reducer(previousState, action);

        expect(newState[500].data.length).toEqual(1);
        expect(newState[500].data).toContainEqual({subject: 'other-subject', access: 'Write', collectionId: 500});
        expect(newState[500].invalidated).toBe(true);
    });

    it('should not fail when deleting a collaborator that does not exist', () => {
        const previousState = {
            500: {
                data: [
                    {subject: 'other-subject', access: 'Write', collectionId: 500}
                ]
            },
            501: {
                data: []
            }
        };

        const action = {
            type: 'ALTER_PERMISSION_FULFILLED',
            meta: {
                subject: 'my-subject',
                access: 'None',
                collectionId: 500
            }
        };

        const newState = reducer(previousState, action);

        expect(newState[500].data.length).toEqual(1);
        expect(newState[500].data).toContainEqual({subject: 'other-subject', access: 'Write', collectionId: 500});
        expect(newState[500].invalidated).toBe(true);
    });

    it('should not fail when the collection information has not yet been retrieved', () => {
        const previousState = {
            500: {
                data: [
                    {subject: 'other-subject', access: 'Write', collectionId: 500}
                ]
            }
        };

        const action = {
            type: 'ALTER_PERMISSION_FULFILLED',
            meta: {
                subject: 'my-subject',
                access: 'Manage',
                collectionId: 600
            }
        };

        const newState = reducer(previousState, action);

        expect(newState[600].data.length).toEqual(1);
        expect(newState[600].data).toContainEqual({subject: 'my-subject', access: 'Manage', collectionId: 600});
        expect(newState[600].invalidated).toBe(true);
    });
});
