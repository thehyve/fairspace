import reducer from './metadataBySubjectReducers';
import * as actionTypes from "../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../utils/testUtils';

testNoChangedOnUnknownActionType('Metadata by subject reducers', reducer);

describe('Metadata by subject reducers', () => {
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
