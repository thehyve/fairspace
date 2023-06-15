// @ts-nocheck
// @ts-nocheck
import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { STRING_URI } from "../../../constants";
import LinkedDataValuesTable from "../LinkedDataValuesList";
import { LinkedDataRelationTable } from "../LinkedDataRelationTable";
// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({
  adapter: new Adapter()
});
const defaultProperty = {
  key: 'description',
  datatype: STRING_URI,
  label: 'Description',
  values: [{
    value: 'More info'
  }, {
    value: 'My first collection'
  }, {
    value: 'My second collection'
  }],
  maxValuesCount: 4,
  isEditable: true
};
describe('LinkedDataRelationTable elements', () => {
  it('should redirect when opening entry', () => {
    const historyMock = {
      push: jest.fn()
    };
    const wrapper = shallow(<LinkedDataRelationTable history={historyMock} property={defaultProperty} editorPath="/metadata" />);
    const table = wrapper.find(LinkedDataValuesTable);
    expect(table.length).toEqual(1);
    table.prop("onOpen")({
      id: 'http://id'
    });
    expect(historyMock.push).toHaveBeenCalledTimes(1);
    expect(historyMock.push).toHaveBeenCalledWith('/metadata?iri=http%3A%2F%2Fid');
  });
});