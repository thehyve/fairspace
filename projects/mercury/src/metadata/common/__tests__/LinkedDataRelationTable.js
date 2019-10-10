import React from 'react';
import {shallow} from "enzyme";

import {SHACL_ORDER, STRING_URI} from "../../../constants";
import LinkedDataValuesTable from "../LinkedDataValuesTable";
import {LinkedDataRelationTable} from "../LinkedDataRelationTable";

const defaultProperty = {
    key: 'description',
    datatype: STRING_URI,
    label: 'Description',
    values: [{value: 'More info'}, {value: 'My first collection'}, {value: 'My second collection'}],
    maxValuesCount: 4,
    isEditable: true,
    importantPropertyShapes: [
        {[SHACL_ORDER]: [{'@value': 2}], '@id': 'c'},
        {'@id': 'd'},
        {[SHACL_ORDER]: [{'@value': 3}], '@id': 'a'},
        {[SHACL_ORDER]: [{'@value': 1}], '@id': 'b'},
    ]
};

describe('LinkedDataRelationTable elements', () => {
    it('should sort columns based on sh:order', () => {
        // See https://www.w3.org/TR/shacl/#order
        const wrapper = shallow(<LinkedDataRelationTable property={defaultProperty} />);
        const table = wrapper.find(LinkedDataValuesTable);
        expect(table.length).toEqual(1);
        expect(table.prop('columnDefinitions').map(def => def.id)).toEqual(['b', 'c', 'a', 'd']);
    });

    it('should redirect when opening entry', () => {
        const historyMock = {
            push: jest.fn()
        };

        const wrapper = shallow(<LinkedDataRelationTable editorPath="/editor" history={historyMock} property={defaultProperty} />);
        const table = wrapper.find(LinkedDataValuesTable);

        expect(table.length).toEqual(1);

        table.prop("onOpen")({id: 'http://id'});

        expect(historyMock.push).toHaveBeenCalledTimes(1);
        expect(historyMock.push).toHaveBeenCalledWith('/editor?iri=http%3A%2F%2Fid');
    });
});
