import React from 'react';
import {mount, shallow} from "enzyme";
import {ResourceValue} from "../ResourceValueContainer";
import MaterialReactSelect from "../../../../common/MaterialReactSelect";
import BaseInputValue from "../BaseInputValue";

describe('ResourceValue', () => {
    it('should render a dropdown with namespaces', () => {
        const namespaces = [
            {id: 'a', label: 'RDF', prefix: 'rdf', namespace: 'http://rdf'},
            {id: 'b', label: 'Fairspace', namespace: 'http://fairspace.io/ontology#'}
        ];
        const wrapper = shallow(<ResourceValue namespaces={namespaces} />);
        const select = wrapper.find(MaterialReactSelect);

        expect(select.length).toEqual(1);
        expect(select.prop('options')).toEqual([
            {
                id: '',
                label: '(no namespace)',
                value: ''
            },
            {
                id: 'a',
                label: 'RDF',
                value: 'http://rdf'
            },
            {
                id: 'b',
                label: 'Fairspace',
                value: 'http://fairspace.io/ontology#'
            }
        ]);
    });

    it('should render a dropdown when on namespaces are given', () => {
        const wrapper = shallow(<ResourceValue />);
        const select = wrapper.find(MaterialReactSelect);

        expect(select.length).toEqual(1);
        expect(select.prop('options')).toEqual([
            {
                id: '',
                label: '(no namespace)',
                value: ''
            }
        ]);
    });

    it('should prepend the namespace uri to the specified value', () => {
        const onChange = jest.fn();
        const wrapper = shallow(<ResourceValue property={{}} onChange={onChange} />);

        const select = wrapper.find(MaterialReactSelect);
        const input = wrapper.find(BaseInputValue);

        expect(select.length).toEqual(1);
        expect(input.length).toEqual(1);

        // Choose a namespace
        select.prop('onChange')({
            id: 'b',
            label: 'Fairspace',
            value: 'http://fairspace.io/ontology#'
        });

        // Expect no invocations of the parent onChange function
        expect(onChange.mock.calls.length).toEqual(0);

        // Enter a value in the textfield
        input.prop('onChange')({value: 'postfix'});

        expect(onChange.mock.calls.length).toEqual(1);
        expect(onChange.mock.calls[0][0]).toEqual({id: 'http://fairspace.io/ontology#postfix'});
    });

    it('should use the entry id as value for the textfield', () => {
        const wrapper = shallow(<ResourceValue entry={{id: 'http://test'}} />);
        const input = wrapper.find(BaseInputValue);

        expect(input.length).toEqual(1);
        expect(input.prop('entry').value).toEqual('http://test');
    });

});
