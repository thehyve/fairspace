import {metadataCreateReducer} from './allEntitiesReducers';
import * as actionTypes from "../../actions/actionTypes";

describe('All entities reducers', () => {
    it('should return state with newly created metadata', () => {
        const subject = 'http://fairspace.io/ontology#ResearchProject';
        const type = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Class';

        expect(
            metadataCreateReducer(undefined, {
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
