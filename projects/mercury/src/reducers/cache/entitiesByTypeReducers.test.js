import reducer from './entitiesByTypeReducers';
import * as actionTypes from "../../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../../utils/testUtils';

testNoChangedOnUnknownActionType('Entities by type reducers', reducer);

describe('Entities by type reducers', () => {
    it('should return state with added entity on entity creation', () => {
        expect(reducer({}, {
            type: actionTypes.CREATE_METADATA_ENTITY_FULFILLED,
            meta: {type: 'http://fairspace.io/ontology#Analysis'},
        })).toEqual({
            "http://fairspace.io/ontology#Analysis": {
                invalidated: true
            }
        });
    });

    it('should return state with added entity on entity creation, preserving old state', () => {
        expect(reducer({'some-state': 'some-state'}, {
            type: actionTypes.CREATE_METADATA_ENTITY_FULFILLED,
            meta: {type: 'http://fairspace.io/ontology#Analysis'},
        })).toEqual({
            'some-state': 'some-state',
            "http://fairspace.io/ontology#Analysis": {
                invalidated: true
            }
        });
    });
});
