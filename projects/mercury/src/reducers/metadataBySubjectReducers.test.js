import reducer from './metadataBySubjectReducers';
import * as actionTypes from "../actions/actionTypes";

describe('Metadata by subject reducers', () => {
    it('should return the same state unchanged if action type is unknown by reducer', () => {
        const state = {'say what?': 'you can not touch this'};
        expect(reducer(state, {
            type: 'ACTION_THAT_DOES_NOT_EXIST'
        })).toEqual({'say what?': 'you can not touch this'});
    });

    it('should update metadata properly', () => {
        const state = {
            "creatingMetadataEntity": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                pending: false,
                error: false,
                data: [
                    {
                        key: "http://schema.org/creator",
                        label: "Creator",
                        range: "http://fairspace.io/ontology#User",
                        allowMultiple: false,
                        machineOnly: true,
                        multiLine: false,
                        domain: "http://fairspace.io/ontology#Collection"
                    }
                ],
                invalidated: false
            }
        };

        const action = {
            type: actionTypes.UPDATE_METADATA_FULFILLED,
            meta: {
                subject: 'https://workspace.ci.test.fairdev.app/iri/500',
                predicate: 'http://schema.org/creator',
                values: [{
                    id: "some-id",
                    label: "a-label"
                }]
            }
        };

        const exptectedState = {
            "creatingMetadataEntity": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                pending: false,
                error: false,
                data: [
                    {
                        key: "http://schema.org/creator",
                        label: "Creator",
                        values: [
                            {
                                id: "some-id",
                                label: "a-label"
                            }
                        ],
                        range: "http://fairspace.io/ontology#User",
                        allowMultiple: false,
                        machineOnly: true,
                        multiLine: false,
                        domain: "http://fairspace.io/ontology#Collection"
                    }
                ],
                invalidated: true
            }
        };

        expect(reducer(state, action)).toEqual(exptectedState);
    });
});
