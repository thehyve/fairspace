// @ts-nocheck
// @ts-nocheck
import { configure, shallow } from "enzyme";
import React from "react";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import MetadataViewActiveFacetFilters from "../MetadataViewActiveFacetFilters";
// eslint-disable-next-line jest/no-mocks-import
import { mockFacets } from "../__mocks__/MetadataViewAPI";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({
  adapter: new Adapter()
});
describe('MetadataViewActiveFacetFilters', () => {
  it('should not show active filters if no filter added', () => {
    const view = 'Collection';
    const facets = mockFacets(view);
    const wrapper = shallow(<MetadataViewActiveFacetFilters facets={facets} filters={[]} />);
    const activeFilters = wrapper.find(Chip);
    expect(activeFilters.length).toEqual(0);
  });
  it('should render textual filters properly', () => {
    const view = 'Subject';
    const facets = mockFacets(view);
    const wrapper = shallow(<MetadataViewActiveFacetFilters facets={facets} filters={[{
      field: 'Subject_gender',
      values: ['http://example.com/gender#male', 'http://example.com/gender#female']
    }, {
      field: 'Subject_species',
      values: ['http://example.com/species#hs']
    }]} />);
    const activeFilters = wrapper.find(Typography);
    expect(activeFilters.length).toEqual(2);
    expect(activeFilters.at(0).prop('children')).toBe('Gender');
    expect(activeFilters.at(1).prop('children')).toBe('Species');
    const activeFilterValues = wrapper.find(Chip);
    expect(activeFilterValues.length).toEqual(3);
    expect(activeFilterValues.at(0).prop('label')).toBe('Male');
    expect(activeFilterValues.at(1).prop('label')).toBe('Female');
    expect(activeFilterValues.at(2).prop('label')).toBe('Homo sapiens');
  });
  it('should render range filters properly', () => {
    const view = 'Sample';
    const facets = mockFacets(view);
    let wrapper = shallow(<MetadataViewActiveFacetFilters facets={facets} filters={[{
      field: 'Sample_tumorCellularity',
      min: 0,
      max: 3
    }]} />);
    const activeFilters = wrapper.find(Typography);
    expect(activeFilters.length).toEqual(1);
    expect(activeFilters.at(0).prop('children')).toBe('Tumor cellularity');
    let activeFilterValues = wrapper.find(Chip);
    expect(activeFilterValues.length).toEqual(1);
    expect(activeFilterValues.first().prop('label')).toBe('0 - 3');
    // partial filter: min only
    wrapper = shallow(<MetadataViewActiveFacetFilters facets={facets} filters={[{
      field: 'Sample_tumorCellularity',
      min: 2
    }]} />);
    activeFilterValues = wrapper.find(Chip);
    expect(activeFilterValues.length).toEqual(1);
    expect(activeFilterValues.first().prop('label')).toBe('from: 2');
    // partial filter: max only
    wrapper = shallow(<MetadataViewActiveFacetFilters facets={facets} filters={[{
      field: 'Sample_tumorCellularity',
      max: 3
    }]} />);
    activeFilterValues = wrapper.find(Chip);
    expect(activeFilterValues.length).toEqual(1);
    expect(activeFilterValues.first().prop('label')).toBe('to: 3');
  });
});