import reducer, {invalidateFiles} from './filesByCollectionAndPathReducers';

describe('Files by collection and path reducers', () => {
    it('should return the same state unchanged if action type is unknown by reducer', () => {
        const state = {'say what?': 'you can not touch this'};
        expect(reducer(state, {
            type: 'ACTION_THAT_DOES_NOT_EXIST'
        })).toEqual({'say what?': 'you can not touch this'});
    });
    it('should invalidate files and directories', () => {
        const statePre = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: false,
                    error: false,
                    invalidated: false,
                    data: []
                }
            }
        };

        const stateAfterInvalidation = invalidateFiles(statePre, 'https://workspace.ci.test.fairdev.app/iri/500', '/');
        const expectedState = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: false,
                    error: false,
                    invalidated: true,
                    data: []
                }
            }
        };

        expect(stateAfterInvalidation).toEqual(expectedState);
    });
});
