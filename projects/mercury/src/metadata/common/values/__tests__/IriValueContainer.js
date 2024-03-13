import React from 'react';
import {configure, shallow} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

import Autocomplete from '@mui/material/Autocomplete';

import {IriValue} from '../IriValueContainer';

// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({adapter: new Adapter()});

describe('IriValueContainer', () => {
    it('should render a dropdown with namespaces', () => {
        const namespaces = [
            {id: 'a', label: 'RDF', prefix: 'rdf', namespace: 'http://rdf'},
            {id: 'b', label: 'Fairspace', namespace: 'https://fairspace.nl/ontology#'}
        ];
        const wrapper = shallow(<IriValue namespaces={namespaces} />);
        const select = wrapper.find(Autocomplete);

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
                value: 'https://fairspace.nl/ontology#'
            }
        ]);
    });

    it('should render a dropdown when no namespaces are given', () => {
        const wrapper = shallow(<IriValue />);
        const select = wrapper.find(Autocomplete);

        expect(select.length).toEqual(1);
        expect(select.prop('options')).toEqual([
            {
                id: '',
                label: '(no namespace)',
                value: ''
            }
        ]);
    });
});
