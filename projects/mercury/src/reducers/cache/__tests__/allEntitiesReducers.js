import reducer from '../allEntitiesReducers';
import * as actionTypes from "../../../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../../../utils/testUtils';

testNoChangedOnUnknownActionType('All entities reducers', reducer);

describe('All entities reducers', () => {
    it('should return state with newly created metadata', () => {
        const subject = 'http://fairspace.io/ontology#ResearchProject';
        const type = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Class';
        const action = {
            type: actionTypes.CREATE_METADATA_ENTITY_FULFILLED,
            meta: {subject, type},
        };

        expect(reducer({data: []}, action))
            .toEqual({
                data: [{
                    '@id': 'http://fairspace.io/ontology#ResearchProject',
                    '@type': ['http://www.w3.org/1999/02/22-rdf-syntax-ns#Class']
                }],
                invalidated: true,
            });
    });

    it('should return state with newly created metadata properly appended', () => {
        const state = {
            data: [{
                '@id': 'http://fairspace.io/ontology#ResearchProject',
                '@type': ['http://www.w3.org/1999/02/22-rdf-syntax-ns#Class']
            }]
        };
        const action = {
            type: actionTypes.CREATE_METADATA_ENTITY_FULFILLED,
            meta: {subject: 'new-Subject', type: 'new-type'},
        };

        expect(
            reducer(state, action)
        ).toEqual({
            data: [{
                '@id': 'http://fairspace.io/ontology#ResearchProject',
                '@type': ['http://www.w3.org/1999/02/22-rdf-syntax-ns#Class'],
            }, {
                '@id': 'new-Subject',
                '@type': ['new-type']
            }],
            invalidated: true,
        });
    });
});
