import {
    createErrorHandlingPromiseAction, dispatchIfNeeded, promiseReducerFactory, shouldUpdate
} from './redux';

const mockDispatch = (action => Promise.resolve(action));

describe('Error handling promise action', () => {
    it('retrieves data for collections', () => {
        const actionData = {type: 'TEST'};
        const actionCreator = createErrorHandlingPromiseAction(() => actionData);
        const action = actionCreator();
        return expect(action(mockDispatch)).resolves.toEqual(actionData);
    });

    it('handles failures within actions', () => {
        const actionCreator = createErrorHandlingPromiseAction(() => Promise.reject(Error("Test error")));
        const action = actionCreator();
        return expect(action(mockDispatch)).resolves.toBeUndefined();
    });
});

describe('Fetch promise reducer', () => {
    const defaultState = {somestate: {complexObject: 3}};
    const rootHandler = promiseReducerFactory("TEST", defaultState);

    it('initializes without current state', () => {
        const action = {type: 'TEST_PENDING'};
        const newState = rootHandler(undefined, action);

        expect(newState.somestate).toEqual(defaultState.somestate);
        expect(newState.pending).toEqual(true);
    });

    it('handles PENDING actionType', () => {
        const action = {type: 'TEST_PENDING'};
        const state = {current: {currentState: 'test'}};
        const newState = rootHandler(state, action);

        expect(newState.current).toEqual(state.current);
        expect(newState.pending).toEqual(true);
        expect(newState.error).toEqual(false);
    });
    it('handles FULFILLED actionType', () => {
        const action = {type: 'TEST_FULFILLED', payload: 'test-results'};
        const state = {current: {currentState: 'test'}, pending: true};
        const newState = rootHandler(state, action);

        expect(newState.current).toEqual(state.current);
        expect(newState.pending).toEqual(false);
        expect(newState.error).toEqual(false);
        expect(newState.data).toEqual(action.payload);
    });
    it('handles REJECTED actionType', () => {
        const action = {type: 'TEST_REJECTED', payload: new Error('test')};
        const state = {current: {currentState: 'test'}, pending: true};
        const newState = rootHandler(state, action);

        expect(newState.current).toEqual(state.current);
        expect(newState.pending).toEqual(false);
        expect(newState.error).toEqual(action.payload);
    });
    it('handles REJECTED actionType without payload', () => {
        const action = {type: 'TEST_REJECTED'};
        const state = {current: {currentState: 'test'}, pending: true};
        const newState = rootHandler(state, action);

        expect(newState.error).toEqual(true);
    });

    it('handles INVALIDATE actionType', () => {
        const action = {type: 'INVALIDATE_TEST'};
        const state = {current: {currentState: 'test'}, data: {currentData: 'test'}};
        const newState = rootHandler(state, action);

        expect(newState.current).toEqual(state.current);
        expect(newState.invalidated).toEqual(true);
        expect(newState.data).toEqual(state.data);
    });
    it('does not handle other types', () => {
        const types = ['TEST', '', 'OTHER', "TEST_", "REJECTED_TEST"];

        types.forEach((type) => {
            const state = {current: {currentState: 'test'}, data: {currentData: 'test'}};
            const newState = rootHandler(state, {TYPE: type});
            expect(newState).toEqual(state);
        });
    });

    describe('key handling', () => {
        const withKeyHandler = promiseReducerFactory("TEST", defaultState, action => action.key);

        it('stores data for different keys properly', () => {
            const action = {type: 'TEST_FULFILLED', payload: 'test-results', key: 'cache-key'};
            const state = {current: {currentState: 'test'}};
            const newState = withKeyHandler(state, action);

            expect(newState.current).toEqual(state.current);
            expect(newState['cache-key']).toEqual({
                pending: false, data: action.payload, invalidated: false, error: false
            });
        });

        it('overrides data for the same cache key', () => {
            const action = {type: 'TEST_FULFILLED', payload: 'test-results', key: 'cache-key'};
            const state = {'cache-key': {currentState: 'test', pending: true}};
            const newState = withKeyHandler(state, action);

            expect(newState.current).toEqual(state.current);
            expect(newState['cache-key']).toEqual({
                currentState: 'test', pending: false, data: action.payload, invalidated: false, error: false
            });
        });

        it('stores data for different keys independently', () => {
            const action = {type: 'TEST_FULFILLED', payload: 'test-results', key: 'cache-key'};
            const state = {current: {pending: false, data: 'some-data'}};
            const newState = withKeyHandler(state, action);

            expect(newState.current).toEqual(state.current);
            expect(newState['cache-key']).toEqual({
                pending: false, data: action.payload, invalidated: false, error: false
            });
        });
    });
});

describe('Should update', () => {
    it('is false if data is fetched', () => {
        expect(shouldUpdate({
            pending: false, error: false, invalidated: false, data: 'data'
        })).toEqual(false);
    });

    it('is false if data is fetched but is empty', () => {
        expect(shouldUpdate({
            pending: false, error: false, invalidated: false, data: false
        })).toEqual(false);
    });

    it('is true if undefined is passed', () => {
        expect(shouldUpdate()).toEqual(true);
    });

    it('is true if data is invalidated', () => {
        expect(shouldUpdate({invalidated: true})).toEqual(true);
    });

    it('is false if data is invalidated but is already pending', () => {
        expect(shouldUpdate({invalidated: true, pending: true})).toEqual(false);
    });
});

describe('Dispatch If Needed', () => {
    it('dispatches if should update returns true', () => {
        const actionCreator = dispatchIfNeeded(
            () => "testaction",
            () => ({invalidated: true})
        );

        const mockDispatch = jest.fn(() => 'result');
        const result = actionCreator(mockDispatch, () => false);

        expect(mockDispatch.mock.calls.length).toEqual(1);
        expect(mockDispatch.mock.calls[0][0]).toEqual('testaction');
        expect(result).toEqual('result');
    });
    it('looks at the current state for determining update', () => {
        const actionCreator = dispatchIfNeeded(
            () => "testaction",
            state => state
        );

        const mockDispatch = jest.fn(() => 'result');
        const result = actionCreator(mockDispatch, () => ({invalidated: true}));

        expect(mockDispatch.mock.calls.length).toEqual(1);
        expect(mockDispatch.mock.calls[0][0]).toEqual('testaction');
        expect(result).toEqual('result');
    });
    it('resolves with the current value if no update is needed', () => {
        const actionCreator = dispatchIfNeeded(
            () => "testaction",
            () => ({data: 'current-data'})
        );

        const mockDispatch = jest.fn(() => 'result');
        const result = actionCreator(mockDispatch, () => undefined);

        expect(mockDispatch.mock.calls.length).toEqual(0);

        return expect(result).resolves.toEqual({value: 'current-data'});
    });
});
