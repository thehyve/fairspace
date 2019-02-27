import reducer from './metadataBySubjectReducers';
import * as actionTypes from '../actions/actionTypes';
import {testNoChangedOnUnknownActionType} from '../utils/testUtils';

testNoChangedOnUnknownActionType('Metadata by subject reducers', reducer);

describe('Metadata by subject reducers', () => {
    it('should create metdata properly', () => {
        const state = {
            "creatingMetadataEntity": true,
            "http://localhost:3000/iri/biological-samples/001": {
                data: [
                    {
                        key: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                        values: [{id: "http://fairspace.io/ontology#BiologicalSample"},
                        ],
                    },
                ],
                invalidated: false,
            },
        };

        const action = {
            type: actionTypes.CREATE_METADATA_ENTITY_FULFILLED,
            meta: {
                subject: 'http://localhost:3000/iri/biological-samples/123',
                type: 'http://fairspace.io/ontology#BiologicalSample'
            }
        };

        const exptectedState = {
            "creatingMetadataEntity": false,
            "http://localhost:3000/iri/biological-samples/123": {
                data: [
                    {
                        key: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                        values: [{id: "http://fairspace.io/ontology#BiologicalSample"},
                        ],
                    },
                ],
                invalidated: true,
            },
            "http://localhost:3000/iri/biological-samples/001": {
                data: [
                    {
                        key: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                        values: [{id: "http://fairspace.io/ontology#BiologicalSample"},
                        ],
                    },
                ],
                invalidated: false,
            },
        };

        expect(reducer(state, action)).toEqual(exptectedState);
    });

    it('should create metdata properly (empty state)', () => {
        const action = {
            type: actionTypes.CREATE_METADATA_ENTITY_FULFILLED,
            meta: {
                subject: 'http://localhost:3000/iri/biological-samples/123',
                type: 'http://fairspace.io/ontology#BiologicalSample'
            }
        };

        const exptectedState = {
            "creatingMetadataEntity": false,
            "http://localhost:3000/iri/biological-samples/123": {
                data: [
                    {
                        key: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                        values: [{id: "http://fairspace.io/ontology#BiologicalSample"},
                        ],
                    },
                ],
                invalidated: true,
            },
        };

        expect(reducer(undefined, action)).toEqual(exptectedState);
    });

    it('should update metadata properly', () => {
        const state = {
            'creatingMetadataEntity': false,
            'https://workspace.ci.test.fairdev.app/iri/500': {
                pending: false,
                error: false,
                data: [
                    {
                        key: 'http://schema.org/creator',
                        label: 'Creator',
                        range: 'http://fairspace.io/ontology#User',
                        allowMultiple: false,
                        machineOnly: true,
                        multiLine: false,
                        domain: 'http://fairspace.io/ontology#Collection'
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
                    id: 'some-id',
                    label: 'a-label'
                }]
            }
        };

        const exptectedState = {
            'creatingMetadataEntity': false,
            'https://workspace.ci.test.fairdev.app/iri/500': {
                pending: false,
                error: false,
                data: [
                    {
                        key: 'http://schema.org/creator',
                        label: 'Creator',
                        values: [
                            {
                                id: 'some-id',
                                label: 'a-label'
                            }
                        ],
                        range: 'http://fairspace.io/ontology#User',
                        allowMultiple: false,
                        machineOnly: true,
                        multiLine: false,
                        domain: 'http://fairspace.io/ontology#Collection'
                    }
                ],
                invalidated: true
            }
        };

        expect(reducer(state, action)).toEqual(exptectedState);
    });

    it('should return unchanged state if the subject to update is not found', () => {
        const state = {
            'creatingMetadataEntity': false,
            'https://workspace.ci.test.fairdev.app/iri/501': {
                pending: false,
                error: false,
                data: [
                    {
                        key: 'http://schema.org/creator',
                        label: 'Creator',
                        range: 'http://fairspace.io/ontology#User',
                        allowMultiple: false,
                        machineOnly: true,
                        multiLine: false,
                        domain: 'http://fairspace.io/ontology#Collection'
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
                    id: 'some-id',
                    label: 'a-label'
                }]
            }
        };

        const exptectedState = {
            'creatingMetadataEntity': false,
            'https://workspace.ci.test.fairdev.app/iri/501': {
                pending: false,
                error: false,
                data: [
                    {
                        key: 'http://schema.org/creator',
                        label: 'Creator',
                        range: 'http://fairspace.io/ontology#User',
                        allowMultiple: false,
                        machineOnly: true,
                        multiLine: false,
                        domain: 'http://fairspace.io/ontology#Collection'
                    }
                ],
                invalidated: false
            }
        };

        expect(reducer(state, action)).toEqual(exptectedState);
    });
});
