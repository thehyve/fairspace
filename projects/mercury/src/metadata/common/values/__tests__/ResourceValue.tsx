// @ts-nocheck
// @ts-nocheck
import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import ResourceValue from "../ResourceValue";
import IriValueContainer from "../IriValueContainer";
// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({
  adapter: new Adapter()
});
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
      value: 'https://fairspace.nl/ontology#'
    });
    // Expect no invocations of the parent onChange function
    expect(onChange).toHaveBeenCalledTimes(0);
    // Enter a value in the textfield
    iriValue.prop('onLocalPartChange')('postfix');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      id: 'https://fairspace.nl/ontology#postfix'
    });
  });
  it('should use the entry id as value for the textfield', () => {
    const wrapper = shallow(<ResourceValue entry={{
      id: 'http://test'
    }} />);
    const iriValue = wrapper.find(IriValueContainer);
    expect(iriValue.length).toEqual(1);
    expect(iriValue.prop('localPart')).toEqual('http://test');
  });
});