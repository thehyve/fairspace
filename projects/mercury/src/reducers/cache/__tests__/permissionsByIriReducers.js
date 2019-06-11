import reducer from "../permissionsByIriReducers";
import {testNoChangedOnUnknownActionType} from '../../../utils/testUtils';

testNoChangedOnUnknownActionType('Permissions reducers', reducer);

describe('Permissions reducers', () => {
    it('should add collaborators', () => {
        const previousState = {
            'http://example.com/1': {
                data: [
                    {user: 'user-1', access: 'Manage', iri: 'http://example.com/1'}
                ]
            },
            'http://example.com/2': {
                data: []
            }
        };

        const action = {
            type: 'ALTER_PERMISSION_FULFILLED',
            meta: {
                user: 'my-user',
                access: 'Read',
                iri: 'http://example.com/1'
            }
        };

        const newState = reducer(previousState, action);

        expect(newState['http://example.com/1'].data.length).toEqual(2);
        expect(newState['http://example.com/1'].data).toContainEqual({user: 'my-user', access: 'Read', iri: 'http://example.com/1'});
        expect(newState['http://example.com/1'].data).toContainEqual({user: 'user-1', access: 'Manage', iri: 'http://example.com/1'});
        expect(newState['http://example.com/1'].invalidated).toBe(true);
        expect(newState['http://example.com/2'].data.length).toEqual(0);
    });

    it('should update existing collaborators', () => {
        const previousState = {
            'http://example.com/1': {
                data: [
                    {user: 'my-user', access: 'Manage', iri: 'http://example.com/1'}
                ]
            },
            'http://example.com/2': {
                data: []
            }
        };

        const action = {
            type: 'ALTER_PERMISSION_FULFILLED',
            meta: {
                user: 'my-user',
                access: 'Read',
                iri: 'http://example.com/1'
            }
        };

        const newState = reducer(previousState, action);

        expect(newState['http://example.com/1'].data.length).toEqual(1);
        expect(newState['http://example.com/1'].data).toContainEqual({user: 'my-user', access: 'Read', iri: 'http://example.com/1'});
        expect(newState['http://example.com/1'].invalidated).toBe(true);
        expect(newState['http://example.com/2'].data.length).toEqual(0);
    });

    it('should delete existing collaborators', () => {
        const previousState = {
            'http://example.com/1': {
                data: [
                    {user: 'my-user', access: 'Manage', iri: 'http://example.com/1'},
                    {user: 'other-user', access: 'Write', iri: 'http://example.com/1'}
                ]
            },
            'http://example.com/2': {
                data: []
            }
        };

        const action = {
            type: 'ALTER_PERMISSION_FULFILLED',
            meta: {
                user: 'my-user',
                access: 'None',
                iri: 'http://example.com/1'
            }
        };

        const newState = reducer(previousState, action);

        expect(newState['http://example.com/1'].data.length).toEqual(1);
        expect(newState['http://example.com/1'].data).toContainEqual({user: 'other-user', access: 'Write', iri: 'http://example.com/1'});
        expect(newState['http://example.com/1'].invalidated).toBe(true);
    });

    it('should not fail when deleting a collaborator that does not exist', () => {
        const previousState = {
            'http://example.com/1': {
                data: [
                    {user: 'other-user', access: 'Write', iri: 'http://example.com/1'}
                ]
            },
            'http://example.com/2': {
                data: []
            }
        };

        const action = {
            type: 'ALTER_PERMISSION_FULFILLED',
            meta: {
                user: 'my-user',
                access: 'None',
                iri: 'http://example.com/1'
            }
        };

        const newState = reducer(previousState, action);

        expect(newState['http://example.com/1'].data.length).toEqual(1);
        expect(newState['http://example.com/1'].data).toContainEqual({user: 'other-user', access: 'Write', iri: 'http://example.com/1'});
        expect(newState['http://example.com/1'].invalidated).toBe(true);
    });

    it('should not fail when the collection information has not yet been retrieved', () => {
        const previousState = {
            'http://example.com/1': {
                data: [
                    {user: 'other-user', access: 'Write', iri: 'http://example.com/1'}
                ]
            }
        };

        const action = {
            type: 'ALTER_PERMISSION_FULFILLED',
            meta: {
                user: 'my-user',
                access: 'Manage',
                iri: 'http://example.com/3'
            }
        };

        const newState = reducer(previousState, action);

        expect(newState['http://example.com/3'].data.length).toEqual(1);
        expect(newState['http://example.com/3'].data).toContainEqual({user: 'my-user', access: 'Manage', iri: 'http://example.com/3'});
        expect(newState['http://example.com/3'].invalidated).toBe(true);
    });
});
