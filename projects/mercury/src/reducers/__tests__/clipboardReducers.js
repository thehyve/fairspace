import reducer from '../clipboardReducers';
import * as actionTypes from '../../actions/actionTypes';
import {testNoChangedOnUnknownActionType} from '../../utils/testUtils';

testNoChangedOnUnknownActionType('Clipboard reducers', reducer);

describe('Clipboard reducers', () => {
    it('should have type of CUT with proper state for action cut', () => {
        const state = {
            type: null,
            filenames: [],
            pending: false,
            error: false
        };
        const action = {
            type: actionTypes.CLIPBOARD_CUT,
            filenames: ['/coll/dir/file1']
        };

        expect(reducer(state, action))
            .toEqual({
                type: 'CUT',
                filenames: ['/coll/dir/file1'],
                pending: false,
                error: false
            });
    });

    it('should have type of CUT with proper state for action cut (empty state)', () => {
        const action = {
            type: actionTypes.CLIPBOARD_CUT,
            filenames: ['/coll/dir/file1']
        };

        expect(reducer(undefined, action))
            .toEqual({
                type: 'CUT',
                filenames: ['/coll/dir/file1'],
                pending: false,
                error: false
            });
    });

    it('should have type of COPY with proper state for action copy', () => {
        const state = {
            type: null,
            filenames: [],
            pending: false,
            error: false
        };
        const action = {
            type: actionTypes.CLIPBOARD_COPY,
            filenames: ['/coll/dir/file1']
        };

        expect(reducer(state, action))
            .toEqual({
                type: 'COPY',
                filenames: ['/coll/dir/file1'],
                pending: false,
                error: false
            });
    });

    it('should have type of COPY with proper state for action copy (empty state)', () => {
        const action = {
            type: actionTypes.CLIPBOARD_COPY,
            filenames: ['/coll/dir/file1']
        };

        expect(reducer(undefined, action))
            .toEqual({
                type: 'COPY',
                filenames: ['/coll/dir/file1'],
                pending: false,
                error: false
            });
    });

    it('should reset state properly on file paste completion', () => {
        const state = {
            type: null,
            filenames: ['/coll/dir/file'],
            pending: false,
            error: false
        };
        const action = {type: actionTypes.CLIPBOARD_PASTE_FULFILLED};

        expect(reducer(state, action))
            .toEqual({
                error: false,
                pending: false,
                type: null,
                filenames: []
            });
    });

    it('should reset state properly on file paste completion (empty state)', () => {
        const action = {type: actionTypes.CLIPBOARD_PASTE_FULFILLED};
        expect(reducer(undefined, action))
            .toEqual({
                error: false,
                pending: false,
                type: null,
                filenames: []
            });
    });

    it('should set error properly', () => {
        const state = {
            type: null,
            filenames: [],
            pending: false,
            error: false
        };
        const action = {
            type: actionTypes.CLIPBOARD_PASTE_REJECTED,
            payload: 'some kind of error',
        };

        expect(reducer(state, action))
            .toEqual(
                {
                    error: 'some kind of error',
                    filenames: [],
                    pending: false,
                    type: null
                }
            );
    });

    it('should set error properly (empty state)', () => {
        const action = {
            type: actionTypes.CLIPBOARD_PASTE_REJECTED,
            payload: 'some kind of error',
        };

        expect(reducer(undefined, action))
            .toEqual(
                {
                    error: 'some kind of error',
                    filenames: [],
                    pending: false,
                    type: null
                }
            );
    });
});
