import {mount} from "enzyme";
import React from "react";
// eslint-disable-next-line jest/no-mocks-import
import {Checkbox, Slider} from "@material-ui/core";
import FormLabel from "@material-ui/core/FormLabel";
import Input from "@material-ui/core/Input";
import {KeyboardDatePicker} from "@material-ui/pickers";
import Facet from "../MetadataViewFacetFactory";
import TextSelectionFacet from "../facets/TextSelectionFacet";
// eslint-disable-next-line jest/no-mocks-import
import {mockFacets} from "../__mocks__/MetadataViewAPI";
import NumericalRangeSelectionFacet from "../facets/NumericalRangeSelectionFacet";
import DateSelectionFacet from "../facets/DateSelectionFacet";
import {formatDateTime} from "../../../common/utils/genericUtils";

describe('MetadataViewFacetFactory', () => {
    it('should properly handle invalid facet type', () => {
        const wrapper = mount(<Facet
            title="Facet1"
            options={[]}
            type="unknown_type"
            multiple
            onChange={() => {}}
        />);

        expect(wrapper.find(FormLabel).length).toEqual(0);
    });

    it('should render a text selection facet', () => {
        const title = "Gender";
        const options = mockFacets("subjects").find(v => v.title === title).values;
        const wrapper = mount(<Facet
            title={title}
            options={options}
            type="text"
            multiple
            onChange={() => {}}
        />);

        const textSelectionFacet = wrapper.find(TextSelectionFacet);
        expect(textSelectionFacet.length).toEqual(1);
        expect(textSelectionFacet.prop('title')).toEqual(title);

        const facetValues = wrapper.find(Checkbox);
        expect(facetValues.length).toEqual(options.length);
        expect(facetValues.at(0).prop('name')).toBe(options[0].iri);
        expect(facetValues.at(1).prop('name')).toBe(options[1].iri);
        expect(facetValues.at(2).prop('name')).toBe(options[2].iri);
    });

    it('should render a numerical range selection facet', () => {
        const title = "Tumor cellularity";
        const mockFacet = mockFacets("samples").find(v => v.title === title);
        const wrapper = mount(<Facet
            title={title}
            options={[mockFacet.rangeStart, mockFacet.rangeEnd]}
            type="number"
            multiple
            onChange={() => {}}
        />);

        const numericalRangeSelectionFacet = wrapper.find(NumericalRangeSelectionFacet);
        expect(numericalRangeSelectionFacet.length).toEqual(1);
        expect(numericalRangeSelectionFacet.prop('title')).toEqual(title);

        const facetValues = wrapper.find(Input);
        expect(facetValues.length).toEqual(2);
        expect(facetValues.at(0).prop('inputProps').placeholder).toEqual(mockFacet.rangeStart);
        expect(facetValues.at(1).prop('inputProps').placeholder).toEqual(mockFacet.rangeEnd);

        const slider = wrapper.find(Slider);
        expect(slider.length).toEqual(1);
        expect(slider.prop('min')).toEqual(mockFacet.rangeStart);
        expect(slider.prop('max')).toEqual(mockFacet.rangeEnd);
    });

    it('should render a date selection facet', () => {
        const title = "Birth date";
        const mockFacet = mockFacets("subjects").find(v => v.title === title);
        const wrapper = mount(<Facet
            title={title}
            options={[mockFacet.rangeStart, mockFacet.rangeEnd]}
            type="date"
            multiple
            onChange={() => {}}
        />);

        const dateSelectionFacet = wrapper.find(DateSelectionFacet);
        expect(dateSelectionFacet.length).toEqual(1);
        expect(dateSelectionFacet.prop('title')).toEqual(title);

        const facetValues = wrapper.find(KeyboardDatePicker);
        expect(facetValues.length).toEqual(2);
        expect(facetValues.at(0).prop('placeholder')).toEqual(formatDateTime(mockFacet.rangeStart));
        expect(facetValues.at(1).prop('placeholder')).toEqual(formatDateTime(mockFacet.rangeEnd));
        expect(facetValues.at(0).prop('minDate')).toEqual(mockFacet.rangeStart);
        expect(facetValues.at(0).prop('maxDate')).toEqual(mockFacet.rangeEnd);
        expect(facetValues.at(1).prop('minDate')).toEqual(mockFacet.rangeStart);
        expect(facetValues.at(1).prop('maxDate')).toEqual(mockFacet.rangeEnd);
    });
});
