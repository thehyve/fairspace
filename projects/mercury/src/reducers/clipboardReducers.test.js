import reducer from './clipboardReducers';
import * as actionTypes from '../actions/actionTypes';

describe('Clipboard reducers', () => {
    it('should return the same state unchanged if action type is unknown by reducer', () => {
        const state = {'say what?': 'you can not touch this'};
        expect(
            reducer(state, {
                type: 'ACTION_THAT_DOES_NOT_EXIST'
            })
        ).toEqual({'say what?': 'you can not touch this'});
    });

    it('should have type of CUT with proper state for action cut', () => {
        expect(
            reducer(undefined, {
                type: actionTypes.CLIPBOARD_CUT,
                sourcedir: 'dir',
                filenames: ['file1']
            })
        ).toEqual({
            type: 'CUT',
            sourcedir: 'dir',
            filenames: ['file1'],
            pending: false,
            error: false
        });
    });

    it('should have type of COPY with proper state for action copy', () => {
        expect(
            reducer(undefined, {
                type: actionTypes.CLIPBOARD_COPY,
                sourcedir: 'dir',
                filenames: ['file1']
            })
        ).toEqual({
            type: 'COPY',
            sourcedir: 'dir',
            filenames: ['file1'],
            pending: false,
            error: false
        });
    });

    it('should reset state properly on file paste completion', () => {
        expect(
            reducer(undefined, {
                type: actionTypes.CLIPBOARD_PASTE_FULFILLED
            })
        ).toEqual({
            error: false,
            pending: false,
            type: null,
            sourcedir: null,
            filenames: []
        });
    });

    it('should set error properly', () => {
        expect(
            reducer(undefined, {
                type: actionTypes.CLIPBOARD_PASTE_REJECTED,
                payload: 'some kind of error',
            })
        ).toEqual(
            {
                error: 'some kind of error',
                filenames: [],
                pending: false,
                sourcedir: null,
                type: null
            }
        );
    });
});
