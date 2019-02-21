import reducer from './entitiesByTypeReducers';
import * as actionTypes from "../../actions/actionTypes";

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
});
