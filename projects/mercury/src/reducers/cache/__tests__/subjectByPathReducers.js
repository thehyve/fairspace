import reducer from '../subjectByPathReducers';
import * as actionTypes from "../../../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../../../utils/testUtils';

testNoChangedOnUnknownActionType('Subject by path reducers', reducer);

describe('Subject by path reducers', () => {
    it('should set pending state for path on pending action', () => {
        expect(reducer({}, {
            type: actionTypes.STAT_FILE_PENDING,
            meta: {
                path: '/dir'
            },
        })).toEqual({
            "/dir": {
                pending: true
            }
        });
    });

    it('should update state with correct uri for path', () => {
        expect(reducer({}, {
            type: actionTypes.STAT_FILE_FULFILLED,
            payload: {
                props: {
                    iri: 'https://workspace.ci.test.fairdev.app/iri/500'
                }
            },
            meta: {
                path: '/dir'
            },
        })).toEqual({
            "/dir": {
                data: "https://workspace.ci.test.fairdev.app/iri/500"
            }
        });
    });
});
