import {metadataFormChangesReducerPerForm} from './metadataFormReducers';
import * as actionTypes from "../actions/actionTypes";

describe('Metadata form reducer', () => {
    describe('initialization', () => {
        it('should clear updates on initialization', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    {
                        updates: {a: 'b'}
                    }, {
                        type: actionTypes.INITIALIZE_METADATA_FORM
                    }
                )
            ).toEqual({
                updates: {},
                subject: undefined,
                error: false,
                pending: false
            });
        });
        it('should set subject on initialization', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    {
                        updates: {a: 'b'}
                    }, {
                        type: actionTypes.INITIALIZE_METADATA_FORM,
                        subject: 'some-subject'
                    }
                ).subject
            ).toEqual('some-subject');
        });
    });

    describe('adding values', () => {
        it('should add a value when no values are present yet', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    undefined, {
                        type: actionTypes.ADD_METADATA_VALUE,
                        property: {key: 'propertyA', values: ['previousValue']},
                        value: 'added'
                    }
                )
            ).toEqual({
                updates: {propertyA: ['previousValue', 'added']},
                error: false,
                pending: false
            });
        });
        it('should add a value if some updates were already done to this field', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    {
                        updates: {propertyA: ['test']}
                    }, {
                        type: actionTypes.ADD_METADATA_VALUE,
                        property: {key: 'propertyA', values: ['previousValue']},
                        value: 'added'
                    }
                )
            ).toEqual({
                updates: {propertyA: ['test', 'added']}
            });
        });
        it('should not change values for other fields', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    {
                        updates: {propertyA: ['test']}
                    }, {
                        type: actionTypes.ADD_METADATA_VALUE,
                        property: {key: 'propertyB', values: ['previousValue']},
                        value: 'added'
                    }
                )
            ).toEqual({
                updates: {
                    propertyA: ['test'],
                    propertyB: ['previousValue', 'added']
                }
            });
        });
    });

    describe('updating values', () => {
        it('should update a value when no changes are present yet', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    undefined, {
                        type: actionTypes.UPDATE_METADATA_VALUE,
                        property: {key: 'propertyA', values: ['previousValue']},
                        value: 'changed',
                        index: 0
                    }
                )
            ).toEqual({
                updates: {propertyA: ['changed']},
                error: false,
                pending: false
            });
        });
        it('should update a value if some updates were already done to this field', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    {
                        updates: {propertyA: ['test', 'test2']}
                    }, {
                        type: actionTypes.UPDATE_METADATA_VALUE,
                        property: {key: 'propertyA', values: ['previousValue']},
                        value: 'changed',
                        index: 1
                    }
                )
            ).toEqual({
                updates: {propertyA: ['test', 'changed']}
            });
        });
        it('should not change values for other fields', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    {
                        updates: {propertyA: ['test']}
                    }, {
                        type: actionTypes.UPDATE_METADATA_VALUE,
                        property: {key: 'propertyB', values: ['previousValue']},
                        value: 'changed',
                        index: 0
                    }
                )
            ).toEqual({
                updates: {
                    propertyA: ['test'],
                    propertyB: ['changed']
                }
            });
        });
        it('should ignore changes where the index if out of bounds', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    {
                        updates: {propertyA: ['test', 'test2']}
                    }, {
                        type: actionTypes.UPDATE_METADATA_VALUE,
                        property: {key: 'propertyB', values: ['previousValue']},
                        value: 'changed',
                        index: 100
                    }
                )
            ).toEqual({
                updates: {
                    propertyA: ['test', 'test2'],
                    propertyB: ['previousValue']
                }
            });
        });
    });

    describe('deleting values', () => {
        it('should delete a value when no changes are present yet', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    undefined, {
                        type: actionTypes.DELETE_METADATA_VALUE,
                        property: {key: 'propertyA', values: ['previousValue', 'previousValue2']},
                        index: 1
                    }
                )
            ).toEqual({
                updates: {propertyA: ['previousValue']},
                error: false,
                pending: false
            });
        });
        it('should delete a value if some updates were already done to this field', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    {
                        updates: {propertyA: ['test', 'test2', 'test3']}
                    }, {
                        type: actionTypes.DELETE_METADATA_VALUE,
                        property: {key: 'propertyA', values: ['previousValue']},
                        index: 1
                    }
                )
            ).toEqual({
                updates: {propertyA: ['test', 'test3']}
            });
        });
        it('should not change values for other fields', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    {
                        updates: {propertyA: ['test']}
                    }, {
                        type: actionTypes.DELETE_METADATA_VALUE,
                        property: {key: 'propertyB', values: ['previousValue']},
                        index: 0
                    }
                )
            ).toEqual({
                updates: {
                    propertyA: ['test'],
                    propertyB: []
                }
            });
        });
        it('should ignore changes where the index if out of bounds', () => {
            expect(
                metadataFormChangesReducerPerForm(
                    {
                        updates: {propertyA: ['test', 'test2']}
                    }, {
                        type: actionTypes.DELETE_METADATA_VALUE,
                        property: {key: 'propertyB', values: ['previousValue']},
                        index: 100
                    }
                )
            ).toEqual({
                updates: {
                    propertyA: ['test', 'test2'],
                    propertyB: ['previousValue']
                }
            });
        });
    });
});
