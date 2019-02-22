import reducer from './entitiesByTypeReducers';
import * as actionTypes from "../../actions/actionTypes";

describe('Entities by type reducers', () => {
    it('should return the same state unchanged if action type is unknown by reducer', () => {
        const state = {'say what?': 'you can not touch this'};
        expect(reducer(state, {
            type: 'ACTION_THAT_DOES_NOT_EXIST'
        })).toEqual({'say what?': 'you can not touch this'});
    });

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
});
