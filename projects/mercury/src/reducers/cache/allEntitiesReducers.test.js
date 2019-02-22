import reducer from './allEntitiesReducers';
import * as actionTypes from "../../actions/actionTypes";

describe('All entities reducers', () => {
    it('should return the same state unchanged if action type is unknown by reducer', () => {
        const state = {'say what?': 'you can not touch this'};
        expect(reducer(state, {
            type: 'ACTION_THAT_DOES_NOT_EXIST'
        })).toEqual({'say what?': 'you can not touch this'});
    });
    it('should return state with newly created metadata', () => {
        const subject = 'http://fairspace.io/ontology#ResearchProject';
        const type = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Class';

        expect(
            reducer({data: []}, {
                type: actionTypes.CREATE_METADATA_ENTITY_FULFILLED,
                meta: {subject, type},
            })
        ).toEqual({
            data: [{
                '@id': 'http://fairspace.io/ontology#ResearchProject',
                '@type': ['http://www.w3.org/1999/02/22-rdf-syntax-ns#Class']
            }],
            invalidated: true,
        });
    });
});
