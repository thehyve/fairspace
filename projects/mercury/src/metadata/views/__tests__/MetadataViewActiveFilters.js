import {shallow} from "enzyme";
import React from "react";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";
import MetadataViewActiveFilters from "../MetadataViewActiveFilters";
// eslint-disable-next-line jest/no-mocks-import
import {mockFacets} from "../__mocks__/MetadataViewAPI";

describe('MetadataViewActiveFilters', () => {
    it('should not show active filters if no filter added', () => {
        const view = 'collections';
        const facets = mockFacets(view);
        const wrapper = shallow(<MetadataViewActiveFilters
            facets={facets}
            filters={[]}
        />);

        const activeFilters = wrapper.find(Chip);
        expect(activeFilters.length).toEqual(0);
    });

    it('should render textual filters properly', () => {
        const view = 'subjects';
        const facets = mockFacets(view);
        const wrapper = shallow(<MetadataViewActiveFilters
            facets={facets}
            filters={[
                {
                    field: 'gender',
                    values: [
                        'http://example.com/gender#male',
                        'http://example.com/gender#female'
                    ]
                },
                {
                    field: 'species',
                    values: [
                        'http://example.com/species#hs',
                    ]
                }
            ]}
        />);

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
        const view = 'samples';
        const facets = mockFacets(view);
        let wrapper = shallow(<MetadataViewActiveFilters
            facets={facets}
            filters={[
                {
                    field: 'tumorCellularity',
                    min: 0,
                    max: 3
                }
            ]}
        />);

        const activeFilters = wrapper.find(Typography);
        expect(activeFilters.length).toEqual(1);
        expect(activeFilters.at(0).prop('children')).toBe('Tumor cellularity');
        let activeFilterValues = wrapper.find(Chip);
        expect(activeFilterValues.length).toEqual(1);
        expect(activeFilterValues.first().prop('label')).toBe('0 - 3');

        // partial filter: min only
        wrapper = shallow(<MetadataViewActiveFilters
            facets={facets}
            filters={[
                {
                    field: 'tumorCellularity',
                    min: 2
                }
            ]}
        />);
        activeFilterValues = wrapper.find(Chip);
        expect(activeFilterValues.length).toEqual(1);
        expect(activeFilterValues.first().prop('label')).toBe('from: 2');

        // partial filter: max only
        wrapper = shallow(<MetadataViewActiveFilters
            facets={facets}
            filters={[
                {
                    field: 'tumorCellularity',
                    max: 3
                }
            ]}
        />);
        activeFilterValues = wrapper.find(Chip);
        expect(activeFilterValues.length).toEqual(1);
        expect(activeFilterValues.first().prop('label')).toBe('to: 3');
    });
});
