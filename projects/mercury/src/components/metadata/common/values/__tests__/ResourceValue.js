import React from 'react';
import {shallow} from "enzyme";
import ResourceValue from "../ResourceValue";
import IriValueContainer from "../IriValueContainer";

describe('ResourceValue', () => {
    it('should prepend the namespace uri to the specified value', () => {
        const onChange = jest.fn();
        const wrapper = shallow(<ResourceValue property={{}} onChange={onChange} />);

        const iriValue = wrapper.find(IriValueContainer);
        expect(iriValue.length).toEqual(1);

        // Choose a namespace
        iriValue.prop('onNamespaceChange')({
            id: 'b',
            label: 'Fairspace',
            value: 'http://fairspace.io/ontology#'
        });

        // Expect no invocations of the parent onChange function
        expect(onChange.mock.calls.length).toEqual(0);

        // Enter a value in the textfield
        iriValue.prop('onLocalPartChange')('postfix');

        expect(onChange.mock.calls.length).toEqual(1);
        expect(onChange.mock.calls[0][0]).toEqual({id: 'http://fairspace.io/ontology#postfix'});
    });

    it('should use the entry id as value for the textfield', () => {
        const wrapper = shallow(<ResourceValue entry={{id: 'http://test'}} />);
        const iriValue = wrapper.find(IriValueContainer);
        expect(iriValue.length).toEqual(1);

        expect(iriValue.prop('localPart')).toEqual('http://test');
    });

});
