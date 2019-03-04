import reducer from "./jsonLdBySubjectReducers";
import {FETCH_METADATA, UPDATE_METADATA} from "../../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../../utils/testUtils';

testNoChangedOnUnknownActionType('Metadata reducer', reducer);

describe('Metadata reducers', () => {
    describe('metadata retrieval', () => {
        it('should store pending state per subject', () => {
            const previousState = {'previous-subject': 'test'};
            const action = {
                type: `${FETCH_METADATA}_PENDING`,
                meta: {subject: 'my-subject'}
            };

            const newState = reducer(previousState, action);

            expect(newState['previous-subject']).toEqual('test');
            expect(newState['my-subject'].pending).toEqual(true);
        });

        it('should store retrieved metadata per subject', () => {
            const previousState = {'previous-subject': 'test'};
            const action = {
                type: `${FETCH_METADATA}_FULFILLED`,
                meta: {subject: 'my-subject'},
                payload: 'new-metadata'
            };

            const newState = reducer(previousState, action);

            expect(newState['previous-subject']).toEqual('test');
            expect(newState['my-subject'].pending).toEqual(false);
            expect(newState['my-subject'].data).toEqual('new-metadata');
        });

        it('should store errors per subject', () => {
            const previousState = {'previous-subject': 'test'};
            const action = {
                type: `${FETCH_METADATA}_REJECTED`,
                meta: {subject: 'my-subject'},
                payload: new Error('new-metadata')
            };

            const newState = reducer(previousState, action);

            expect(newState['previous-subject']).toEqual('test');
            expect(newState['my-subject'].pending).toEqual(false);
            expect(newState['my-subject'].error).toEqual(new Error('new-metadata'));
        });
    });

    describe('metadata invalidation', () => {
        it('should invalidate subject metadata upon invalidation action', () => {
            const previousState = {'previous-subject': 'test'};
            const action = {
                type: `INVALIDATE_${FETCH_METADATA}`,
                meta: {subject: 'my-subject'}
            };

            const newState = reducer(previousState, action);

            expect(newState['previous-subject']).toEqual('test');
            expect(newState['my-subject'].invalidated).toBeTruthy();
        });

        it('should invalidate subject metadata when metadata is updated', () => {
            const previousState = {'previous-subject': 'test'};
            const action = {
                type: `${UPDATE_METADATA}_FULFILLED`,
                meta: {subject: 'my-subject'}
            };

            const newState = reducer(previousState, action);

            expect(newState['previous-subject']).toEqual('test');
            expect(newState['my-subject'].invalidated).toBeTruthy();
        });
    });
});
